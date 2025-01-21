const db = require("./databaseConnection");

async function setupTables() {
  try {
    console.log("Dropping existing tables...");
    await db.query("DROP TABLE IF EXISTS orders");
    await db.query("DROP TABLE IF EXISTS product");
    console.log("Existing tables dropped successfully");

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
        UNIQUE KEY unique_product_size (product_id, size)
      )
    `;
    await db.query(createVariationsTable);
    console.log("Product variations table created successfully");

    const createOrdersTable = `
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variation_id INT,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (variation_id) REFERENCES product_variations(id)
      )
    `;
    await db.query(createOrdersTable);
    console.log("Orders table created successfully");

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

    sampleProducts.map((product) => async () => {
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
          { size: "S", price: 19.99, stock: 50 },
          { size: "M", price: 19.99, stock: 75 },
          { size: "L", price: 24.99, stock: 60 },
        ];

        for (const variation of variations) {
          await db.query(
            `INSERT INTO product_variations (product_id, size, price, stock)
                 VALUES (?, ?, ?, ?)`,
            [result.insertId, variation.size, variation.price, variation.stock]
          );
        }
      }
    });
    console.log("Sample products inserted successfully");
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
