const express = require("express");
const router = express.Router();
const OrderService = require("../services/orderService");

router.get("/", async (req, res) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const orders = await OrderService.getOrderByUserId(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/", async (req, res) => {
  const { userId, cart, paymentMethod, status } = req.body;
  try {
    const result = await OrderService.createOrder(
      userId,
      cart,
      paymentMethod,
      status
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/:id", async (req, res) => {
  const { quantity } = req.body;
  const orderId = req.params.id;
  try {
    const result = await OrderService.updateOrder(orderId, quantity);
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    await OrderService.deleteOrder(orderId);
    res.status(200).send("Order deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
