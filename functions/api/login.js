const encoder = new TextEncoder();

function constantTimeEqual(valueA, valueB) {
  const a = encoder.encode(String(valueA));
  const b = encoder.encode(String(valueB));

  let difference = a.length ^ b.length;
  const maxLength = Math.max(a.length, b.length);

  for (let i = 0; i < maxLength; i += 1) {
    difference |= (a[i] || 0) ^ (b[i] || 0);
  }

  return difference === 0;
}

function toBase64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function createSessionToken(secret) {
  const payload = {
    role: "employee",
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  };

  const encodedPayload = toBase64Url(
    encoder.encode(JSON.stringify(payload))
  );

  const signingKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    signingKey,
    encoder.encode(encodedPayload)
  );

  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...additionalHeaders
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed." },
      405,
      { Allow: "POST" }
    );
  }

  if (!env.EMPLOYEE_PASSWORD || !env.SESSION_SECRET) {
    console.error("Required login secrets are missing.");

    return jsonResponse(
      { success: false, error: "Login service is not configured." },
      500
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid request body." },
      400
    );
  }

  const password =
    typeof body.password === "string" ? body.password : "";

  if (!constantTimeEqual(password, env.EMPLOYEE_PASSWORD)) {
    return jsonResponse(
      { success: false, error: "Incorrect employee password." },
      401
    );
  }

  const sessionToken = await createSessionToken(env.SESSION_SECRET);

  return jsonResponse(
    {
      success: true,
      message: "Employee login successful."
    },
    200,
    {
      "Set-Cookie":
        `malevolent_session=${sessionToken}; ` +
        "HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800"
    }
  );
}