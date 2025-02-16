const Product = require("../models/productModel");

class ProductService {
  async createProduct(productData) {
    return Product.create(productData);
  }

  async getAllProducts() {
    return Product.getAll();
  }

  async getProductById(id) {
    const product = await Product.getById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async getVariationById(id) {
    const variation = await Product.getVariationById(id);
    if (!variation) {
      throw new Error("Variation not found");
    }
    return variation;
  }

  async updateProduct(id, productData) {
    await this.getProductById(id);
    return Product.update(id, productData);
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    return Product.delete(id);
  }

  validateProductData(productData) {
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

    if (!name) {
      throw new Error("Product name is required");
    }

    if (variations && variations.length > 0) {
      variations.forEach((variation) => {
        if (!variation.size) {
          throw new Error("Size is required for each variation");
        }
        if (typeof variation.price !== "number" || variation.price <= 0) {
          throw new Error("Valid price is required for each variation");
        }
        if (typeof variation.stock !== "number" || variation.stock < 0) {
          throw new Error(
            "Valid stock quantity is required for each variation"
          );
        }
      });
    } else {
      if (typeof price !== "number" || price <= 0) {
        throw new Error("Valid price is required for non-variation products");
      }
      if (typeof stock !== "number" || stock < 0) {
        throw new Error(
          "Valid stock quantity is required for non-variation products"
        );
      }
    }

    return true;
  }
}

module.exports = new ProductService();
