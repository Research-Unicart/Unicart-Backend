const express = require('express');
const router = express.Router();
const ProductService = require('../services/productService');

router.get('/', async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const result = await ProductService.createProduct(name, description, price, stock);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  const { name, description, price, stock } = req.body;
  const productId = req.params.id;
  try {
    const result = await ProductService.updateProduct(productId, name, description, price, stock);
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await ProductService.deleteProduct(productId);
    res.status(200).send('Product deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
