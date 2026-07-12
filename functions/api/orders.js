const encoder = new TextEncoder();

const SESSION_COOKIE = "__Host-malevolent_session";

const MAX_ORDERS_RETURNED = 500;
const MAX_ITEMS_PER_ORDER = 100;
const MAX_ITEM_QUANTITY = 999;
const MAX_ITEM_PRICE = 1_000_000;

/**
 * Send a JSON response with security and cache headers.
 */
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

/**
 * Handle GET /api/orders.
 *
 * Only a logged-in employee may retrieve orders.
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.DB) {
    console.error("Missing DB binding.");

    return json(
      {
        success: false,
        error: "Order database is not configured.",
      },
      500,
    );
  }

  if (!env.SESSION_SECRET) {
    console.error("Missing SESSION_SECRET.");

    return json(
      {
        success: false,
        error: "Employee authentication is not configured.",
      },
      500,
    );
  }

  const session = await verifyEmployeeSession(
    request,
    env.SESSION_SECRET,
  );

  if (!session) {
    return json(
      {
        success: false,
        error: "Employee session is invalid or expired.",
      },
      401,
    );
  }

  try {
    const orders = await getAllOrders(env.DB);

    return json({
      success: true,
      employeeBadge: session.badge,
      orders,
    });
  } catch (error) {
    console.error("Could not load orders:", error);

    return json(
      {
        success: false,
        error: "Could not load orders.",
      },
      500,
    );
  }
}

/**
 * Handle POST /api/orders.
 *
 * Customers do not need an employee session to place an order.
 */
export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.DB) {
    console.error("Missing DB binding.");

    return json(
      {
        success: false,
        error: "Order database is not configured.",
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
        error: "Request body must be valid JSON.",
      },
      400,
    );
  }

  const validation = validateOrder(body);

  if (!validation.success) {
    return json(
      {
        success: false,
        error: validation.error,
      },
      400,
    );
  }

  const orderData = validation.order;

  try {
    /*
     * If the browser retries the same request, return the existing
     * order instead of creating a duplicate.
     */
    const existingOrder =
      await findOrderByClientRequestId(
        env.DB,
        orderData.clientRequestId,
      );

    if (existingOrder) {
      const fullOrder = await getOrderById(
        env.DB,
        existingOrder.id,
      );

      return json({
        success: true,
        duplicate: true,
        orderId: existingOrder.id,
        order: fullOrder,
      });
    }

    const now = Date.now();

    const orderId =
      `shrine-${now}-` +
      crypto.randomUUID();

    const statements = [
      env.DB.prepare(
        `
          INSERT INTO orders (
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
          )
          VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NULL)
        `,
      ).bind(
        orderId,
        orderData.clientRequestId,
        orderData.customerName,
        orderData.site,
        orderData.notes,
        orderData.grandTotal,
        now,
        now,
      ),

      ...orderData.items.map((item, itemIndex) =>
        env.DB.prepare(
          `
            INSERT INTO order_items (
              order_id,
              item_index,
              name,
              quantity,
              price
            )
            VALUES (?, ?, ?, ?, ?)
          `,
        ).bind(
          orderId,
          itemIndex,
          item.name,
          item.quantity,
          item.price,
        ),
      ),
    ];

    /*
     * D1 batch operations are transactional. If an item insert fails,
     * the entire order insert is rolled back.
     */
    await env.DB.batch(statements);

    const createdOrder = await getOrderById(
      env.DB,
      orderId,
    );

    return json(
      {
        success: true,
        duplicate: false,
        orderId,
        order: createdOrder,
      },
      201,
    );
  } catch (error) {
    console.error("Could not create order:", error);

    /*
     * A duplicate request could arrive between the initial lookup
     * and the INSERT. Check once more before returning an error.
     */
    try {
      const existingOrder =
        await findOrderByClientRequestId(
          env.DB,
          orderData.clientRequestId,
        );

      if (existingOrder) {
        const fullOrder = await getOrderById(
          env.DB,
          existingOrder.id,
        );

        return json({
          success: true,
          duplicate: true,
          orderId: existingOrder.id,
          order: fullOrder,
        });
      }
    } catch (lookupError) {
      console.error(
        "Duplicate-order recovery failed:",
        lookupError,
      );
    }

    return json(
      {
        success: false,
        error: "Could not create the order.",
      },
      500,
    );
  }
}

/**
 * Reject unsupported methods.
 */
export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Validate and normalize a submitted order.
 */
function validateOrder(body) {
  if (!body || typeof body !== "object") {
    return {
      success: false,
      error: "Order data is missing.",
    };
  }

  const clientRequestId = String(
    body.clientRequestId ?? "",
  ).trim();

  const customerName = String(
    body.customerName ?? "",
  ).trim();

  const site = String(
    body.site ?? "",
  )
    .trim()
    .toLowerCase();

  const notes = String(
    body.notes ?? "",
  ).trim();

  if (
    !clientRequestId ||
    clientRequestId.length > 120
  ) {
    return {
      success: false,
      error: "The order request ID is invalid.",
    };
  }

  if (
    !customerName ||
    customerName.length > 60
  ) {
    return {
      success: false,
      error:
        "Customer name must be between 1 and 60 characters.",
    };
  }

  if (
    site !== "cherno" &&
    site !== "novo"
  ) {
    return {
      success: false,
      error: "Select either Cherno or Novo.",
    };
  }

  if (notes.length > 500) {
    return {
      success: false,
      error:
        "Order notes cannot exceed 500 characters.",
    };
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return {
      success: false,
      error: "The order must contain at least one item.",
    };
  }

  if (
    body.items.length >
    MAX_ITEMS_PER_ORDER
  ) {
    return {
      success: false,
      error:
        `An order cannot contain more than ` +
        `${MAX_ITEMS_PER_ORDER} unique items.`,
    };
  }

  const normalizedItems = [];
  const itemNames = new Set();

  for (const rawItem of body.items) {
    if (
      !rawItem ||
      typeof rawItem !== "object"
    ) {
      return {
        success: false,
        error: "One or more order items are invalid.",
      };
    }

    const name = String(
      rawItem.name ?? "",
    ).trim();

    const quantity = Math.trunc(
      Number(
        rawItem.qty ??
        rawItem.quantity ??
        0,
      ),
    );

    const price = Math.trunc(
      Number(rawItem.price ?? 0),
    );

    if (
      !name ||
      name.length > 150
    ) {
      return {
        success: false,
        error: "An item name is invalid.",
      };
    }

    if (itemNames.has(name)) {
      return {
        success: false,
        error:
          `The item "${name}" appears more than once.`,
      };
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_ITEM_QUANTITY
    ) {
      return {
        success: false,
        error:
          `The quantity for "${name}" is invalid.`,
      };
    }

    if (
      !Number.isInteger(price) ||
      price < 0 ||
      price > MAX_ITEM_PRICE
    ) {
      return {
        success: false,
        error:
          `The price for "${name}" is invalid.`,
      };
    }

    itemNames.add(name);

    normalizedItems.push({
      name,
      quantity,
      price,
    });
  }

  const grandTotal =
    normalizedItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0,
    );

  if (
    !Number.isSafeInteger(grandTotal) ||
    grandTotal < 0
  ) {
    return {
      success: false,
      error: "The calculated order total is invalid.",
    };
  }

  return {
    success: true,

    order: {
      clientRequestId,
      customerName,
      site,
      notes,
      grandTotal,
      items: normalizedItems,
    },
  };
}

/**
 * Load all orders, their items, and fulfillment totals.
 */
async function getAllOrders(db) {
  const [
    ordersResult,
    itemsResult,
    fulfillmentsResult,
  ] = await db.batch([
    db.prepare(
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
        ORDER BY created_at DESC
        LIMIT ?
      `,
    ).bind(MAX_ORDERS_RETURNED),

    db.prepare(
      `
        SELECT
          oi.id,
          oi.order_id,
          oi.item_index,
          oi.name,
          oi.quantity,
          oi.price
        FROM order_items AS oi
        INNER JOIN orders AS o
          ON o.id = oi.order_id
        ORDER BY
          o.created_at DESC,
          oi.item_index ASC
      `,
    ),

    db.prepare(
      `
        SELECT
          oi.order_id,
          oi.item_index,
          f.employee_badge,
          SUM(f.quantity) AS quantity
        FROM fulfillments AS f
        INNER JOIN order_items AS oi
          ON oi.id = f.order_item_id
        GROUP BY
          oi.order_id,
          oi.item_index,
          f.employee_badge
        ORDER BY
          oi.order_id,
          oi.item_index,
          f.employee_badge
      `,
    ),
  ]);

  return assembleOrders(
    ordersResult.results || [],
    itemsResult.results || [],
    fulfillmentsResult.results || [],
  );
}

/**
 * Load one complete order.
 */
async function getOrderById(db, orderId) {
  const [
    orderResult,
    itemsResult,
    fulfillmentsResult,
  ] = await db.batch([
    db.prepare(
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
    ).bind(orderId),

    db.prepare(
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
    ).bind(orderId),

    db.prepare(
      `
        SELECT
          oi.order_id,
          oi.item_index,
          f.employee_badge,
          SUM(f.quantity) AS quantity
        FROM fulfillments AS f
        INNER JOIN order_items AS oi
          ON oi.id = f.order_item_id
        WHERE oi.order_id = ?
        GROUP BY
          oi.order_id,
          oi.item_index,
          f.employee_badge
        ORDER BY
          oi.item_index,
          f.employee_badge
      `,
    ).bind(orderId),
  ]);

  const assembled = assembleOrders(
    orderResult.results || [],
    itemsResult.results || [],
    fulfillmentsResult.results || [],
  );

  return assembled[0] || null;
}

/**
 * Check for an existing order created from the same browser request.
 */
async function findOrderByClientRequestId(
  db,
  clientRequestId,
) {
  return db.prepare(
    `
      SELECT id
      FROM orders
      WHERE client_request_id = ?
      LIMIT 1
    `,
  )
    .bind(clientRequestId)
    .first();
}

/**
 * Convert database rows into the format expected by assets/index.js.
 */
function assembleOrders(
  orderRows,
  itemRows,
  fulfillmentRows,
) {
  const orders = new Map();

  for (const row of orderRows) {
    orders.set(String(row.id), {
      id: String(row.id),

      clientRequestId: String(
        row.client_request_id ?? "",
      ),

      customerName: String(
        row.customer_name ?? "Unknown",
      ),

      site: String(
        row.site ?? "",
      ).toLowerCase(),

      notes: String(
        row.notes ?? "",
      ),

      grandTotal: Number(
        row.grand_total ?? 0,
      ),

      status: String(
        row.status ?? "pending",
      ).toLowerCase(),

      createdAt: Number(
        row.created_at ?? 0,
      ),

      updatedAt: Number(
        row.updated_at ?? 0,
      ),

      completedAt:
        row.completed_at === null ||
        row.completed_at === undefined
          ? null
          : Number(row.completed_at),

      items: [],
    });
  }

  const itemsByKey = new Map();

  for (const row of itemRows) {
    const orderId = String(
      row.order_id,
    );

    const order = orders.get(orderId);

    if (!order) {
      continue;
    }

    const itemIndex = Number(
      row.item_index ?? 0,
    );

    const item = {
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
    };

    order.items[itemIndex] = item;

    itemsByKey.set(
      `${orderId}:${itemIndex}`,
      item,
    );
  }

  for (const row of fulfillmentRows) {
    const orderId = String(
      row.order_id,
    );

    const itemIndex = Number(
      row.item_index ?? 0,
    );

    const badge = String(
      row.employee_badge ?? "",
    );

    const quantity = Number(
      row.quantity ?? 0,
    );

    const item = itemsByKey.get(
      `${orderId}:${itemIndex}`,
    );

    if (
      !item ||
      !badge ||
      quantity <= 0
    ) {
      continue;
    }

    item.fulfillments[badge] =
      quantity;
  }

  return Array.from(
    orders.values(),
  ).map((order) => ({
    ...order,
    items: order.items.filter(Boolean),
  }));
}

/**
 * Verify the signed employee session cookie created by login.js.
 */
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

  const tokenParts = token.split(".");

  if (tokenParts.length !== 2) {
    return null;
  }

  const [
    encodedPayload,
    encodedSignature,
  ] = tokenParts;

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

/**
 * Parse a Cookie header into an object.
 */
function parseCookies(cookieHeader) {
  const cookies = {};

  for (
    const part of
      cookieHeader.split(";")
  ) {
    const separatorIndex =
      part.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const name = part
      .slice(0, separatorIndex)
      .trim();

    const value = part
      .slice(separatorIndex + 1)
      .trim();

    if (name) {
      cookies[name] = value;
    }
  }

  return cookies;
}

/**
 * Decode URL-safe Base64.
 */
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