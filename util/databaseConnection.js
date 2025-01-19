const mysql = require('mysql2');

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678',
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          reject('Error connecting to MySQL: ' + err.stack);
        } else {
          resolve('Connected to MySQL');
        }
      });
    });
  }

  createDatabase() {
    return new Promise((resolve, reject) => {
      this.connection.query('CREATE DATABASE IF NOT EXISTS shop_db', (err, results) => {
        if (err) {
          reject('Error creating database: ' + err);
        } else {
          resolve('Database "shop_db" is ready.');
        }
      });
    });
  }

  useDatabase() {
    this.connection.changeUser({ database: 'shop_db' }, (err) => {
      if (err) {
        throw new Error('Error selecting database: ' + err);
      }
    });
  }

  createTables() {
    const productTableQuery = `
      CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL
      );
    `;
    
    const orderTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(id)
      );
    `;
    
    return new Promise((resolve, reject) => {
      this.connection.query(productTableQuery, (err, results) => {
        if (err) {
          reject('Error creating product table: ' + err);
        } else {
          this.connection.query(orderTableQuery, (err, results) => {
            if (err) {
              reject('Error creating orders table: ' + err);
            } else {
              resolve('Tables created successfully.');
            }
          });
        }
      });
    });
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  close() {
    this.connection.end();
  }
}

module.exports = new Database();
