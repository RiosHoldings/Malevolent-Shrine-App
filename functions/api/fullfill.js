const encoder = new TextEncoder();

const SESSION_COOKIE =
  "__Host-malevolent_session";

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

  if (!env.DB) {
    console.error(
      "Missing D1 binding named DB.",
    );

    return json(
      {
        success: false,
        error:
          "Order database is not configured.",
      },
      500,
    );
  }

  if (!env.SESSION_SECRET) {
    console.error(
      "Missing SESSION_SECRET.",
    );

    return json(
      {
        success: false,
        error:
          "Employee authentication is not configured.",
      },
      500,
    );
  }

  const session =
    await verifyEmployeeSession(
      request,
      env.SESSION_SECRET,
    );

  if (!session) {
    return json(
      {
        success: false,
        error:
          "Employee session is invalid or expired.",
      },
      401,
    );
  }

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

  const orderId = String(
    body?.orderId ?? "",
  ).trim();

  const itemIndex = Math.trunc(
    Number(body?.itemIndex),
  );

  const quantity = Math.trunc(
    Number(body?.quantity),
  );

  if (
    !orderId ||
    orderId.length > 200
  ) {
    return json(
      {
        success: false,
        error: "Invalid order ID.",
      },
      400,
    );
  }

  if (
    !Number.isInteger(itemIndex) ||
    itemIndex < 0
  ) {
    return json(
      {
        success: false,
        error: "Invalid item index.",
      },
      400,
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 999
  ) {
    return json(
      {
        success: false,
        error:
          "Fulfillment quantity must be between 1 and 999.",
      },
      400,
    );
  }

  try {
    const order = await env.DB
      .prepare(
        `
          SELECT
            id,
            status
          FROM orders
          WHERE id = ?
          LIMIT 1
        `,
      )
      .bind(orderId)
      .first();

    if (!order) {
      return json(
        {
          success: false,
          error: "Order was not found.",
        },
        404,
      );
    }

    if (order.status === "complete") {
      return json(
        {
          success: false,
          error:
            "This order is already complete.",
        },
        409,
      );
    }

    const item = await env.DB
      .prepare(
        `
          SELECT
            id,
            name,
            quantity,
            price
          FROM order_items
          WHERE
            order_id = ?
            AND item_index = ?
          LIMIT 1
        `,
      )
      .bind(
        orderId,
        itemIndex,
      )
      .first();

    if (!item) {
      return json(
        {
          success: false,
          error:
            "The selected order item was not found.",
        },
        404,
      );
    }

    const now = Date.now();

    /*
     * This INSERT only succeeds if the new
     * quantity will not exceed the item's
     * requested quantity.
     */
    const insertResult =
      await env.DB
        .prepare(
          `
            INSERT INTO fulfillments (
              order_item_id,
              employee_badge,
              quantity,
              created_at
            )
            SELECT
              oi.id,
              ?,
              ?,
              ?
            FROM order_items AS oi
            INNER JOIN orders AS o
              ON o.id = oi.order_id
            WHERE
              oi.order_id = ?
              AND oi.item_index = ?
              AND o.status != 'complete'
              AND (
                COALESCE(
                  (
                    SELECT
                      SUM(f.quantity)
                    FROM fulfillments AS f
                    WHERE
                      f.order_item_id = oi.id
                  ),
                  0
                ) + ?
              ) <= oi.quantity
          `,
        )
        .bind(
          session.badge,
          quantity,
          now,
          orderId,
          itemIndex,
          quantity,
        )
        .run();

    const insertedRows = Number(
      insertResult?.meta?.changes ??
        insertResult?.changes ??
        0,
    );

    if (insertedRows < 1) {
      const fulfillmentTotal =
        await env.DB
          .prepare(
            `
              SELECT
                COALESCE(
                  SUM(quantity),
                  0
                ) AS fulfilled
              FROM fulfillments
              WHERE order_item_id = ?
            `,
          )
          .bind(item.id)
          .first();

      const alreadyFulfilled =
        Number(
          fulfillmentTotal?.fulfilled ??
            0,
        );

      const remaining = Math.max(
        0,
        Number(item.quantity) -
          alreadyFulfilled,
      );

      return json(
        {
          success: false,

          error:
            remaining > 0
              ? `Only ${remaining} remaining.`
              : "This item is already completely fulfilled.",

          remaining,
        },
        409,
      );
    }

    const incompleteItem =
      await env.DB
        .prepare(
          `
            SELECT
              oi.id
            FROM order_items AS oi
            WHERE
              oi.order_id = ?
              AND COALESCE(
                (
                  SELECT
                    SUM(f.quantity)
                  FROM fulfillments AS f
                  WHERE
                    f.order_item_id = oi.id
                ),
                0
              ) < oi.quantity
            LIMIT 1
          `,
        )
        .bind(orderId)
        .first();

    const orderIsComplete =
      !incompleteItem;

    await env.DB
      .prepare(
        `
          UPDATE orders
          SET
            status = ?,
            updated_at = ?,
            completed_at = ?
          WHERE id = ?
        `,
      )
      .bind(
        orderIsComplete
          ? "complete"
          : "active",

        now,

        orderIsComplete
          ? now
          : null,

        orderId,
      )
      .run();

    const updatedOrder =
      await getOrderById(
        env.DB,
        orderId,
      );

    return json({
      success: true,

      fulfillment: {
        orderId,
        itemIndex,
        itemName: String(item.name),
        badge: session.badge,
        quantity,
        value:
          Number(item.price) *
          quantity,
      },

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Fulfillment failed:",
      error,
    );

    return json(
      {
        success: false,
        error:
          "The fulfillment could not be saved.",
      },
      500,
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

async function getOrderById(
  db,
  orderId,
) {
  const [
    orderResult,
    itemResult,
    fulfillmentResult,
  ] = await db.batch([
    db
      .prepare(
        `
          SELECT
            id,
            client_request_id,
            customer_name,
            site,
            notes,
            grand_total,
            status,
            created_at,
            updated_at,
            completed_at
          FROM orders
          WHERE id = ?
          LIMIT 1
        `,
      )
      .bind(orderId),

    db
      .prepare(
        `
          SELECT
            id,
            order_id,
            item_index,
            name,
            quantity,
            price
          FROM order_items
          WHERE order_id = ?
          ORDER BY item_index ASC
        `,
      )
      .bind(orderId),

    db
      .prepare(
        `
          SELECT
            oi.item_index,
            f.employee_badge,
            SUM(f.quantity) AS quantity
          FROM fulfillments AS f
          INNER JOIN order_items AS oi
            ON oi.id = f.order_item_id
          WHERE oi.order_id = ?
          GROUP BY
            oi.item_index,
            f.employee_badge
          ORDER BY
            oi.item_index,
            f.employee_badge
        `,
      )
      .bind(orderId),
  ]);

  const orderRow =
    orderResult.results?.[0];

  if (!orderRow) {
    return null;
  }

  const items = (
    itemResult.results || []
  ).map((row) => ({
    id: Number(row.id),

    name: String(
      row.name ?? "Unknown Item",
    ),

    qty: Number(
      row.quantity ?? 0,
    ),

    price: Number(
      row.price ?? 0,
    ),

    fulfillments: {},
  }));

  for (
    const row of
      fulfillmentResult.results || []
  ) {
    const index = Number(
      row.item_index,
    );

    const item = items[index];

    if (!item) {
      continue;
    }

    const badge = String(
      row.employee_badge ?? "",
    );

    const fulfilledQuantity =
      Number(row.quantity ?? 0);

    if (
      badge &&
      fulfilledQuantity > 0
    ) {
      item.fulfillments[badge] =
        fulfilledQuantity;
    }
  }

  return {
    id: String(orderRow.id),

    clientRequestId: String(
      orderRow.client_request_id ?? "",
    ),

    customerName: String(
      orderRow.customer_name ??
        "Unknown",
    ),

    site: String(
      orderRow.site ?? "",
    ).toLowerCase(),

    notes: String(
      orderRow.notes ?? "",
    ),

    grandTotal: Number(
      orderRow.grand_total ?? 0,
    ),

    status: String(
      orderRow.status ?? "pending",
    ).toLowerCase(),

    createdAt: Number(
      orderRow.created_at ?? 0,
    ),

    updatedAt: Number(
      orderRow.updated_at ?? 0,
    ),

    completedAt:
      orderRow.completed_at === null ||
      orderRow.completed_at === undefined
        ? null
        : Number(
            orderRow.completed_at,
          ),

    items,
  };
}

async function verifyEmployeeSession(
  request,
  secret,
) {
  const cookies = parseCookies(
    request.headers.get("Cookie") || "",
  );

  const token =
    cookies[SESSION_COOKIE];

  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [
    encodedPayload,
    encodedSignature,
  ] = parts;

  try {
    const signingKey =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["verify"],
      );

    const validSignature =
      await crypto.subtle.verify(
        "HMAC",
        signingKey,
        base64UrlToBytes(
          encodedSignature,
        ),
        encoder.encode(
          encodedPayload,
        ),
      );

    if (!validSignature) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(
        base64UrlToBytes(
          encodedPayload,
        ),
      ),
    );

    const now = Math.floor(
      Date.now() / 1000,
    );

    if (
      payload.role !== "employee" ||
      !payload.badge ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      badge: String(payload.badge),
      role: "employee",
      expiresAt: Number(payload.exp),
    };
  } catch (error) {
    console.error(
      "Session verification failed:",
      error,
    );

    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};

  for (
    const part of
      cookieHeader.split(";")
  ) {
    const separator =
      part.indexOf("=");

    if (separator < 0) {
      continue;
    }

    const name = part
      .slice(0, separator)
      .trim();

    const value = part
      .slice(separator + 1)
      .trim();

    if (name) {
      cookies[name] = value;
    }
  }

  return cookies;
}

function base64UrlToBytes(value) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const paddingLength =
    (4 - (normalized.length % 4)) % 4;

  const padded =
    normalized +
    "=".repeat(paddingLength);

  const binary = atob(padded);

  const bytes =
    new Uint8Array(binary.length);

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  return bytes;
}