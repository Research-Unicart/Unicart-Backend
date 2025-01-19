const db = require('../util/databaseConnection');

class Order {
  async create(productId, quantity, totalPrice) {
    const query = `INSERT INTO orders (product_id, quantity, total_price) VALUES (?, ?, ?)`;
    return db.query(query, [productId, quantity, totalPrice]);
  }

  async getAll() {
    const query = 'SELECT * FROM orders';
    return db.query(query);
  }

  async getById(id) {
    const query = 'SELECT * FROM orders WHERE id = ?';
    return db.query(query, [id]);
  }

  async update(id, quantity, totalPrice) {
    const query = `UPDATE orders SET quantity = ?, total_price = ? WHERE id = ?`;
    return db.query(query, [quantity, totalPrice, id]);
  }

  async delete(id) {
    const query = 'DELETE FROM orders WHERE id = ?';
    return db.query(query, [id]);
  }
}

module.exports = new Order();
