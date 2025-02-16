const bcrypt = require("bcrypt");
const db = require("./databaseConnection");

async function setupTables() {
  try {
    console.log("Dropping existing tables...");
    await db.query("DROP TABLE IF EXISTS order_items");
    await db.query("DROP TABLE IF EXISTS orders");
    await db.query("DROP TABLE IF EXISTS product_variations");
    await db.query("DROP TABLE IF EXISTS product");
    await db.query("DROP TABLE IF EXISTS users");
    console.log("Existing tables dropped successfully");

    const createUsersTable = `
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(createUsersTable);
    console.log("Users table created successfully");

    const createProductTable = `
      CREATE TABLE product (
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
      )
    `;
    await db.query(createProductTable);
    console.log("Product table created successfully");

    const createVariationsTable = `
      CREATE TABLE product_variations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variation VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_variation (product_id, variation)
      )
    `;
    await db.query(createVariationsTable);
    console.log("Product variations table created successfully");

    const createOrdersTable = `
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    await db.query(createOrdersTable);
    console.log("Orders table created successfully");

    const createOrderItemsTable = `
      CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        variation_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (variation_id) REFERENCES product_variations(id)
      )
    `;
    await db.query(createOrderItemsTable);
    console.log("Order items table created successfully");

    const hashedPassword = await bcrypt.hash("password123", 10);
    await db.query(
      `INSERT INTO users (name, email, password) 
       VALUES (?, ?, ?)`,
      ["Test User", "test@example.com", hashedPassword]
    );
    console.log("Sample user created successfully");

    const sampleProducts = [
      {
        name: "Wireless Mouse",
        category: "Electronics",
        rating: 4.5,
        description: "High-performance wireless mouse",
        specs: JSON.stringify([
          "2.4GHz Wireless",
          "USB-C Charging",
          "6 Buttons",
        ]),
        images: JSON.stringify(["/images/mouse1.jpg", "/images/mouse2.jpg"]),
        has_variations: false,
        base_price: 29.99,
        base_stock: 100,
      },
      {
        name: "Classic T-Shirt",
        category: "Clothing",
        rating: 4.0,
        description: "Comfortable cotton t-shirt",
        specs: JSON.stringify(["100% Cotton", "Machine Washable"]),
        images: JSON.stringify(["/images/tshirt1.jpg", "/images/tshirt2.jpg"]),
        has_variations: true,
        base_price: null,
        base_stock: null,
      },
    ];

    for (const product of sampleProducts) {
      const [result] = await db.query(
        `INSERT INTO product 
         (name, category, rating, description, specs, images, has_variations, base_price, base_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.category,
          product.rating,
          product.description,
          product.specs,
          product.images,
          product.has_variations,
          product.base_price,
          product.base_stock,
        ]
      );

      if (product.name === "Classic T-Shirt") {
        const variations = [
          { variation: "Small", price: 19.99, stock: 50 },
          { variation: "Medium", price: 19.99, stock: 75 },
          { variation: "Large", price: 24.99, stock: 60 },
        ];

        for (const variation of variations) {
          await db.query(
            `INSERT INTO product_variations (product_id, variation, price, stock)
             VALUES (?, ?, ?, ?)`,
            [
              result.insertId,
              variation.variation,
              variation.price,
              variation.stock,
            ]
          );
        }
      }
    }
    console.log("Sample products and variations inserted successfully");

    const [user] = await db.query("SELECT id FROM users LIMIT 1");
    const [product] = await db.query(
      'SELECT id FROM product WHERE name = "Wireless Mouse" LIMIT 1'
    );

    const [order] = await db.query(
      `INSERT INTO orders (user_id, payment_method, total_price, status)
       VALUES (?, ?, ?, ?)`,
      [user[0].id, "Credit Card", 29.99, "completed"]
    );

    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [order.insertId, product[0].id, 1, 29.99]
    );
    console.log("Sample order and order items created successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await db.close();
  }
}

db.connect()
  .then(() => db.useDatabase())
  .then(() => setupTables())
  .then(() => {
    console.log("Database setup completed successfully");
    db.close();
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    db.close();
  });
