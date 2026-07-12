function json(
  data,
  status = 200,
  extraHeaders = {},
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control": "no-store",

        "X-Content-Type-Options":
          "nosniff",

        ...extraHeaders,
      },
    },
  );
}

export async function onRequestPost(
  context,
) {
  const { request, env } = context;

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        error:
          "Request body must be valid JSON.",
      },
      400,
    );
  }

  const site = String(
    body?.site ?? "",
  )
    .trim()
    .toLowerCase();

  if (
    site !== "cherno" &&
    site !== "novo"
  ) {
    return json(
      {
        success: false,
        error:
          "Discord notification requires Cherno or Novo.",
      },
      400,
    );
  }

  const webhookUrl =
    site === "cherno"
      ? env.DISCORD_WEBHOOK_CHERNO
      : env.DISCORD_WEBHOOK_NOVO;

  if (!webhookUrl) {
    console.error(
      `Missing Discord webhook for ${site}.`,
    );

    return json(
      {
        success: false,
        error:
          `${capitalize(site)} Discord webhook is not configured.`,
      },
      500,
    );
  }

  /*
   * Supports either:
   *
   * {
   *   site: "cherno",
   *   payload: {
   *     content: "...",
   *     embeds: [...]
   *   }
   * }
   *
   * or:
   *
   * {
   *   site: "cherno",
   *   content: "...",
   *   embeds: [...]
   * }
   */
  const submittedPayload =
    body?.payload &&
    typeof body.payload === "object"
      ? body.payload
      : body;

  const content =
    submittedPayload.content === undefined
      ? undefined
      : String(
          submittedPayload.content,
        ).slice(0, 2000);

  const embeds = Array.isArray(
    submittedPayload.embeds,
  )
    ? submittedPayload.embeds.slice(0, 10)
    : [];

  if (
    !content &&
    embeds.length === 0
  ) {
    return json(
      {
        success: false,
        error:
          "Discord content or embeds are required.",
      },
      400,
    );
  }

  const discordPayload = {
    username:
      site === "cherno"
        ? "Malevolent Shrine — Cherno"
        : "Malevolent Shrine — Novo",

    allowed_mentions: {
      parse: [],
    },
  };

  if (content) {
    discordPayload.content = content;
  }

  if (embeds.length > 0) {
    discordPayload.embeds =
      embeds.map(sanitizeEmbed);
  }

  try {
    const discordResponse =
      await fetch(webhookUrl, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          discordPayload,
        ),
      });

    if (!discordResponse.ok) {
      const discordError =
        await discordResponse
          .text()
          .catch(() => "");

      console.error(
        `Discord rejected ${site} notification:`,
        discordResponse.status,
        discordError,
      );

      return json(
        {
          success: false,
          error:
            "Discord rejected the notification.",
        },
        502,
      );
    }

    return json({
      success: true,
      site,
    });
  } catch (error) {
    console.error(
      `Could not contact ${site} Discord webhook:`,
      error,
    );

    return json(
      {
        success: false,
        error:
          "Could not send the Discord notification.",
      },
      502,
    );
  }
}

export function onRequestGet() {
  return json(
    {
      success: false,
      error: "Method not allowed.",
    },
    405,
    {
      Allow: "POST",
    },
  );
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

function sanitizeEmbed(rawEmbed) {
  if (
    !rawEmbed ||
    typeof rawEmbed !== "object"
  ) {
    return {};
  }

  const embed = {};

  if (rawEmbed.title !== undefined) {
    embed.title = String(
      rawEmbed.title,
    ).slice(0, 256);
  }

  if (
    rawEmbed.description !== undefined
  ) {
    embed.description = String(
      rawEmbed.description,
    ).slice(0, 4096);
  }

  if (rawEmbed.url !== undefined) {
    embed.url = String(
      rawEmbed.url,
    ).slice(0, 2048);
  }

  if (
    Number.isInteger(
      Number(rawEmbed.color),
    )
  ) {
    embed.color = Number(
      rawEmbed.color,
    );
  }

  if (rawEmbed.timestamp) {
    embed.timestamp = String(
      rawEmbed.timestamp,
    );
  }

  if (
    Array.isArray(rawEmbed.fields)
  ) {
    embed.fields =
      rawEmbed.fields
        .slice(0, 25)
        .map((field) => ({
          name: String(
            field?.name ?? "Information",
          ).slice(0, 256),

          value: String(
            field?.value ?? "—",
          ).slice(0, 1024),

          inline:
            field?.inline === true,
        }));
  }

  if (
    rawEmbed.footer &&
    typeof rawEmbed.footer === "object"
  ) {
    embed.footer = {
      text: String(
        rawEmbed.footer.text ?? "",
      ).slice(0, 2048),
    };
  }

  if (
    rawEmbed.thumbnail?.url
  ) {
    embed.thumbnail = {
      url: String(
        rawEmbed.thumbnail.url,
      ).slice(0, 2048),
    };
  }

  if (rawEmbed.image?.url) {
    embed.image = {
      url: String(
        rawEmbed.image.url,
      ).slice(0, 2048),
    };
  }

  return embed;
}

function capitalize(value) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}