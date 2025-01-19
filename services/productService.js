const Product = require('../models/productModel');

class ProductService {
  async createProduct(name, description, price, stock) {
    return Product.create(name, description, price, stock);
  }

  async getAllProducts() {
    return Product.getAll();
  }

  async getProductById(id) {
    return Product.getById(id);
  }

  async updateProduct(id, name, description, price, stock) {
    return Product.update(id, name, description, price, stock);
  }

  async deleteProduct(id) {
    return Product.delete(id);
  }
}

module.exports = new ProductService();
