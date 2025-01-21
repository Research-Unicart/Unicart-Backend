const mysql = require("mysql2");

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "12345678",
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          reject("Error connecting to MySQL: " + err.stack);
        } else {
          resolve("Connected to MySQL");
        }
      });
    });
  }

  createDatabase() {
    return new Promise((resolve, reject) => {
      this.connection.query(
        "CREATE DATABASE IF NOT EXISTS shop_db",
        (err, results) => {
          if (err) {
            reject("Error creating database: " + err);
          } else {
            resolve('Database "shop_db" is ready.');
          }
        }
      );
    });
  }

  useDatabase() {
    this.connection.changeUser({ database: "shop_db" }, (err) => {
      if (err) {
        throw new Error("Error selecting database: " + err);
      }
    });
  }

  createTables() {
    const productTableQuery = `
      CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        rating DECIMAL(2, 1),
        description TEXT,
        specs JSON,
        images JSON,
        has_variations BOOLEAN DEFAULT FALSE,
        base_price DECIMAL(10, 2),
        base_stock INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    const variationsTableQuery = `
      CREATE TABLE IF NOT EXISTS product_variations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        size VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_size (product_id, size)
      );
    `;

    const orderTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variation_id INT,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (variation_id) REFERENCES product_variations(id)
      );
    `;

    return new Promise((resolve, reject) => {
      this.connection.query(productTableQuery, (err, results) => {
        if (err) {
          reject("Error creating product table: " + err);
          return;
        }

        this.connection.query(variationsTableQuery, (err, results) => {
          if (err) {
            reject("Error creating variations table: " + err);
            return;
          }

          this.connection.query(orderTableQuery, (err, results) => {
            if (err) {
              reject("Error creating orders table: " + err);
              return;
            }
            resolve("Tables created successfully.");
          });
        });
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

  async transaction() {
    return new Promise((resolve, reject) => {
      this.connection.beginTransaction((err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            commit: () => {
              return new Promise((resolve, reject) => {
                this.connection.commit((err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              });
            },
            rollback: () => {
              return new Promise((resolve, reject) => {
                this.connection.rollback(() => {
                  resolve();
                });
              });
            },
          });
        }
      });
    });
  }

  close() {
    this.connection.end();
  }
}

module.exports = new Database();
