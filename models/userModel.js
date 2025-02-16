const mysqlConnection = require("../util/databaseConnection");

class User {
  static async create(name, email, password) {
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    try {
      const result = await mysqlConnection.query(query, [
        name,
        email,
        password,
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    try {
      const rows = await mysqlConnection.query(query, [email]);
      if (rows === null) {
        return null;
      }
      if (rows.length === 0) {
        return null;
      }

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = "SELECT id, name, email FROM users WHERE id = ?";
    try {
      const [rows] = await mysqlConnection.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const query = "UPDATE users SET name = ?, email = ? WHERE id = ?";
    try {
      const [result] = await mysqlConnection.query(query, [
        data.name,
        data.email,
        id,
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
