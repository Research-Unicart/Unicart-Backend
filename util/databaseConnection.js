const mysql = require("mysql2");

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "12345678",
      database: "shop_db",
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
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

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
        variation VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_product_variation (product_id, variation),
        CONSTRAINT product_variations_ibfk_1 FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    const orderTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL, -- Added payment_method column
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const orderItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES product(id)
      );
    `;

    return new Promise((resolve, reject) => {
      this.connection.query(userTableQuery, (err) => {
        if (err) {
          reject("Error creating users table: " + err);
          return;
        }

        this.connection.query(productTableQuery, (err) => {
          if (err) {
            reject("Error creating product table: " + err);
            return;
          }

          this.connection.query(variationsTableQuery, (err) => {
            if (err) {
              reject("Error creating variations table: " + err);
              return;
            }

            this.connection.query(orderTableQuery, (err) => {
              if (err) {
                reject("Error creating orders table: " + err);
                return;
              }

              this.connection.query(orderItemsTableQuery, (err) => {
                if (err) {
                  reject("Error creating order_items table: " + err);
                  return;
                }
                resolve("All tables created successfully.");
              });
            });
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
