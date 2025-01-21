const Order = require('../models/orderModel');
const Product = require('../models/productModel');

class OrderService {
  async createOrder(productList) {
     productList.map(async (product) => {
      console.log('product', product);
      const { productId, quantity } = product;
      const productData = await Product.getById(productId);
      if (!productData) {
        throw new Error('Product not found!');
      }
      const totalPrice = productData.price * quantity;
      return Order.create(productId, quantity, totalPrice);
    });
    const product = await Product.getById(productId);
    if (!product) {
      throw new Error('Product not found!');
    }

    const totalPrice = product[0].price * quantity;
    return Order.create(productId, quantity, totalPrice);
  }

  async getAllOrders() {
    return Order.getAll();
  }

  async getOrderById(id) {
    return Order.getById(id);
  }

  async updateOrder(id, quantity) {
    const order = await Order.getById(id);
    if (!order) {
      throw new Error('Order not found!');
    }

    const product = await Product.getById(order[0].product_id);
    const totalPrice = product[0].price * quantity;
    return Order.update(id, quantity, totalPrice);
  }

  async deleteOrder(id) {
    return Order.delete(id);
  }
}

module.exports = new OrderService();
