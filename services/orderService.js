const Order = require("../models/orderModel");
const Product = require("../models/productModel");

class OrderService {
  async createOrder(userId, cart, paymentMethod, status) {
    let totalPrice = 0;

    const res = await Order.create(userId, paymentMethod, totalPrice, status);

    const orderItemPromises = cart.map(async (product) => {
      const { productId, quantity, variationId } = product;

      const productData = await Product.getById(productId);
      if (!productData) {
        throw new Error("Product not found!");
      }
      let itemPrice = 0;
      if (variationId === null) {
        itemPrice = parseFloat(productData[0].base_price) * quantity;
      } else {
        const variation = await Product.getVariationById(variationId);
        if (!variation || variation.length === 0) {
          throw new Error("Product variation not found!");
        }

        const price = parseFloat(variation[0].price);
        itemPrice = price * quantity;
      }
      totalPrice += itemPrice;

      await Order.createOrderItems(
        res.insertId,
        productId,
        variationId,
        quantity,
        itemPrice
      );
    });

    await Promise.all(orderItemPromises);

    await Order.update(res.insertId, totalPrice);

    return res.insertId;
  }

  async getAllOrders() {
    return Order.getAll();
  }

  async getOrderByUserId(userId) {
    return Order.getOrderByUserId(userId);
  }
  async getOrderById(id) {
    return Order.getById(id);
  }

  async updateOrder(id, quantity) {
    const order = await Order.getById(id);
    if (!order) {
      throw new Error("Order not found!");
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
