const db = require('../util/databaseConnection');

class Product {
  async create(name, description, price, stock) {
    const query = `INSERT INTO product (name, description, price, stock) VALUES (?, ?, ?, ?)`;
    return db.query(query, [name, description, price, stock]);
  }

  async getAll() {
    const query = 'SELECT * FROM product';
    return db.query(query);
  }

  async getById(id) {
    const query = 'SELECT * FROM product WHERE id = ?';
    return db.query(query, [id]);
  }

  async update(id, name, description, price, stock) {
    const query = `UPDATE product SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`;
    return db.query(query, [name, description, price, stock, id]);
  }

  async delete(id) {
    const query = 'DELETE FROM product WHERE id = ?';
    return db.query(query, [id]);
  }
}

module.exports = new Product();
