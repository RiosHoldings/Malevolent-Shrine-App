const encoder = new TextEncoder();

const SESSION_COOKIE = "__Host-malevolent_session";
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function bytesToBase64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function textToBase64Url(value) {
  return bytesToBase64Url(
    encoder.encode(value),
  );
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value),
  );

  return new Uint8Array(digest);
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (
    let index = 0;
    index < left.length;
    index += 1
  ) {
    difference |=
      left[index] ^ right[index];
  }

  return difference === 0;
}

async function passwordsMatch(
  submittedPassword,
  configuredPassword,
) {
  const [
    submittedHash,
    configuredHash,
  ] = await Promise.all([
    sha256(submittedPassword),
    sha256(configuredPassword),
  ]);

  return constantTimeEqual(
    submittedHash,
    configuredHash,
  );
}

async function importSigningKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
}

async function createSessionToken({
  badge,
  secret,
}) {
  const issuedAt = Math.floor(
    Date.now() / 1000,
  );

  const payload = {
    badge,
    role: "employee",
    iat: issuedAt,
    exp:
      issuedAt +
      SESSION_LIFETIME_SECONDS,
    nonce: crypto.randomUUID(),
  };

  const encodedPayload =
    textToBase64Url(
      JSON.stringify(payload),
    );

  const signingKey =
    await importSigningKey(secret);

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      signingKey,
      encoder.encode(encodedPayload),
    );

  return (
    `${encodedPayload}.` +
    bytesToBase64Url(
      new Uint8Array(signature),
    )
  );
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
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

  if (
    !env.EMPLOYEE_PASSWORD ||
    !env.SESSION_SECRET
  ) {
    console.error(
      "Missing EMPLOYEE_PASSWORD or " +
      "SESSION_SECRET Cloudflare secret.",
    );

    return json(
      {
        success: false,
        error:
          "Employee login is not configured.",
      },
      500,
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

  const badge = String(
    body?.badge ?? "",
  ).trim();

  const password = String(
    body?.password ?? "",
  );

  if (!/^\d{1,20}$/.test(badge)) {
    return json(
      {
        success: false,
        error:
          "Enter a valid badge number.",
      },
      400,
    );
  }

  if (
    !password ||
    password.length > 256
  ) {
    return json(
      {
        success: false,
        error:
          "Enter a valid employee password.",
      },
      400,
    );
  }

  const validPassword =
    await passwordsMatch(
      password,
      env.EMPLOYEE_PASSWORD,
    );

  if (!validPassword) {
    return json(
      {
        success: false,
        error:
          "Incorrect employee password.",
      },
      401,
    );
  }

  const sessionToken =
    await createSessionToken({
      badge,
      secret: env.SESSION_SECRET,
    });

  return json(
    {
      success: true,
      badge,
      expiresIn:
        SESSION_LIFETIME_SECONDS,
    },
    200,
    {
      "Set-Cookie": [
        `${SESSION_COOKIE}=${sessionToken}`,
        "Path=/",
        `Max-Age=${SESSION_LIFETIME_SECONDS}`,
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
      ].join("; "),
    },
  );
}