const db = require("../util/databaseConnection");

class Product {
  async create(productData) {
    const {
      name,
      category,
      rating,
      description,
      variations,
      specs,
      images,
      base_price,
      base_stock,
    } = productData;

    try {
      const hasVariations = variations !== null && variations !== undefined;

      const productResult = await db.query(
        `INSERT INTO product (
          name, category, rating, description, specs, images, 
          has_variations, base_price, base_stock
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          category,
          rating,
          description,
          JSON.stringify(specs),
          JSON.stringify(images),
          hasVariations,
          base_price,
          base_stock,
        ]
      );
      const productId = productResult.insertId;
      if (hasVariations) {
        variations.forEach(async (variation) => {
          await db.query(
            `INSERT INTO product_variations (product_id, variation, price, stock)
             VALUES (?, ?, ?, ?)`,
            [productId, variation.variation, variation.price, variation.stock]
          );
        });
      }
      return productId;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const query = "SELECT * FROM product";
      const res = await db.query(query);
      if (res.length === 0) {
        return [];
      }
      const finalResults = [];
      for (const product of res) {
        const productId = product.id;

        const query2 = `SELECT * FROM product_variations WHERE product_id = ?`;
        const rows = await db.query(query2, [productId]);

        product.variations = rows;

        finalResults.push(product);
      }

      return finalResults;
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  }

  async getById(id) {
    try {
      const query = "SELECT * FROM product WHERE id=?";
      const product = await db.query(query, [id]);

      if (product.length === 0) {
        return [];
      }

      const productId = product[0].id;

      const query2 = "SELECT * FROM product_variations WHERE product_id = ?";
      const variations = await db.query(query2, [productId]);
      product[0].variations = variations;

      return [product[0]];
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  }

  async update(id, productData) {
    const {
      name,
      category,
      rating,
      description,
      specs,
      images,
      variations,
      price,
      stock,
    } = productData;

    try {
      await db.beginTransaction();

      const hasVariations = Array.isArray(variations) && variations.length > 0;

      await db.query(
        `UPDATE product 
         SET name = ?, 
             category = ?,
             rating = ?,
             description = ?,
             specs = ?,
             images = ?,
             has_variations = ?,
             base_price = ?,
             base_stock = ?
         WHERE id = ?`,
        [
          name,
          category,
          rating,
          description,
          JSON.stringify(specs),
          JSON.stringify(images),
          hasVariations,
          hasVariations ? null : price,
          hasVariations ? null : stock,
          id,
        ]
      );

      if (hasVariations) {
        await db.query("DELETE FROM product_variations WHERE product_id = ?", [
          id,
        ]);
        for (const variation of variations) {
          await db.query(
            `INSERT INTO product_variations (product_id, size, price, stock)
             VALUES (?, ?, ?, ?)`,
            [id, variation.size, variation.price, variation.stock]
          );
        }
      } else {
        await db.query("DELETE FROM product_variations WHERE product_id = ?", [
          id,
        ]);
      }

      return this.getById(id);
    } catch (error) {
      await db.rollback();
      throw error;
    }
  }

  async delete(id) {
    const query = "DELETE FROM product WHERE id = ?";
    return db.query(query, [id]);
  }

  formatProductData(product) {
    if (!product) return null;

    const formatted = {
      ...product,
      specs: JSON.parse(product.specs || "[]"),
      images: JSON.parse(product.images || "[]"),
    };

    if (product.has_variations) {
      formatted.variations = JSON.parse(product.variations || "[]");
    } else {
      formatted.price = product.base_price;
      formatted.stock = product.base_stock;
    }

    return formatted;
  }
}

module.exports = new Product();
