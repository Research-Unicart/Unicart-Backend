const db = require("../util/databaseConnection");

class Order {
  async create(userId, payment_method, total_price, status) {
    const query = `INSERT INTO orders (user_id, payment_method, total_price, status) VALUES (?, ?, ?, ?)`;
    return db.query(query, [userId, payment_method, total_price, status]);
  }

  async createOrderItems(orderId, productId, variation_id, quantity, price) {
    const query = `INSERT INTO order_items (order_id, product_id, variation_id, quantity, price) VALUES (?, ?, ?, ?, ?)`;
    return db.query(query, [orderId, productId, variation_id, quantity, price]);
  }

  async getAll() {
    const query = `
      SELECT 
        o.id AS orderId,
        o.user_id AS userId,
        o.payment_method AS paymentMethod,
        o.status AS status,
        o.created_at AS orderCreatedAt,
        oi.id AS orderItemId,
        oi.product_id AS productId,
        oi.quantity AS quantity,
        oi.price AS price,
        oi.created_at AS orderItemCreatedAt
      FROM 
        orders o
      LEFT JOIN 
        order_items oi ON o.id = oi.order_id
      ORDER BY 
        o.id, oi.id;
    `;

    try {
      const rows = await db.query(query);
      const orders = [];
      let currentOrder = null;

      rows.forEach((row) => {
        if (!currentOrder || currentOrder.orderId !== row.orderId) {
          if (currentOrder) {
            orders.push(currentOrder);
          }
          currentOrder = {
            orderId: row.orderId,
            userId: row.userId,
            paymentMethod: row.paymentMethod,
            status: row.status,
            orderCreatedAt: row.orderCreatedAt,
            items: [],
          };
        }

        if (row.orderItemId) {
          currentOrder.items.push({
            orderItemId: row.orderItemId,
            productId: row.productId,
            quantity: row.quantity,
            price: row.price,
            orderItemCreatedAt: row.orderItemCreatedAt,
          });
        }
      });

      if (currentOrder) {
        orders.push(currentOrder);
      }

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getById(id) {
    const query = "SELECT * FROM orders WHERE id = ?";
    return db.query(query, [id]);
  }

  async update(id, totalPrice) {
    const query = `UPDATE orders SET total_price = ? WHERE id = ?`;
    return db.query(query, [totalPrice, id]);
  }

  async delete(id) {
    const query = "DELETE FROM orders WHERE id = ?";
    return db.query(query, [id]);
  }

  async getOrderByUserId(userId) {
    const query = `
      SELECT 
        o.id AS orderId,
        o.user_id AS userId,
        o.payment_method AS paymentMethod,
        o.status AS status,
        o.created_at AS orderCreatedAt,
        oi.id AS orderItemId,
        oi.product_id AS productId,
        oi.quantity AS quantity,
        oi.price AS price,
        oi.created_at AS orderItemCreatedAt
      FROM 
        orders o
      LEFT JOIN 
        order_items oi ON o.id = oi.order_id
      WHERE
        o.user_id = ?
      ORDER BY 
        o.id, oi.id;
    `;

    try {
      const rows = await db.query(query, [userId]);

      if (!Array.isArray(rows)) {
        throw new Error("Unexpected result format from database query");
      }

      const orders = [];
      let currentOrder = null;

      rows.forEach((row) => {
        if (!currentOrder || currentOrder.orderId !== row.orderId) {
          if (currentOrder) {
            orders.push(currentOrder);
          }
          currentOrder = {
            orderId: row.orderId,
            userId: row.userId,
            paymentMethod: row.paymentMethod,
            status: row.status,
            orderCreatedAt: row.orderCreatedAt,
            items: [],
          };
        }
        if (row.orderItemId) {
          currentOrder.items.push({
            orderItemId: row.orderItemId,
            productId: row.productId,
            quantity: row.quantity,
            price: row.price,
            orderItemCreatedAt: row.orderItemCreatedAt,
          });
        }
      });

      if (currentOrder) {
        orders.push(currentOrder);
      }

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }
}

module.exports = new Order();
