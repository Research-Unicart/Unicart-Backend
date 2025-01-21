const express = require("express");
const router = express.Router();
const ProductService = require("../services/productService");

router.get("/", async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/", async (req, res) => {
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
  } = req.body;

  try {
    if (variations && Array.isArray(variations)) {
      variations.forEach((variation) => {
        if (!variation.variation || typeof variation.variation !== "string") {
          return res.status(400).send("Variation name must be a valid string.");
        }

        if (isNaN(variation.stock) || variation.stock < 0) {
          return res
            .status(400)
            .send(`Invalid stock value for variation: ${variation.variation}`);
        }

        if (isNaN(variation.price) || variation.price <= 0) {
          return res
            .status(400)
            .send(`Invalid price value for variation: ${variation.variation}`);
        }
      });
    }
    const productData = {
      name,
      category,
      variations: variations,
      rating: parseFloat(rating),
      description,
      specs: typeof specs === "object" ? JSON.stringify(specs) : null,
      images: Array.isArray(images) ? JSON.stringify(images) : null,
      base_price: parseFloat(base_price),
      base_stock: parseInt(base_stock),
    };

    const result = await ProductService.createProduct(productData);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/all", async (req, res) => {
  const products = req.body;

  const results = [];
  const errors = [];

  for (let product of products) {
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
    } = product;

    try {
      if (variations && Array.isArray(variations)) {
        variations.forEach((variation) => {
          if (!variation.variation || typeof variation.variation !== "string") {
            return res
              .status(400)
              .send("Variation name must be a valid string.");
          }

          if (isNaN(variation.stock) || variation.stock < 0) {
            return res
              .status(400)
              .send(
                `Invalid stock value for variation: ${variation.variation}`
              );
          }

          if (isNaN(variation.price) || variation.price <= 0) {
            return res
              .status(400)
              .send(
                `Invalid price value for variation: ${variation.variation}`
              );
          }
        });
      }
      const productData = {
        name,
        category,
        variations: variations,
        rating: parseFloat(rating),
        description,
        specs: typeof specs === "object" ? JSON.stringify(specs) : null,
        images: Array.isArray(images) ? JSON.stringify(images) : null,
        base_price: parseFloat(base_price),
        base_stock: parseInt(base_stock),
      };

      const result = await ProductService.createProduct(productData);
    } catch (err) {
      errors.push(err.message);
    }
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  return res.status(201).json({
    success: true,
    message: `${results.length} products added successfully.`,
    products: results,
  });
});

router.put("/:id", async (req, res) => {
  const productId = req.params.id;
  console.log("productId", productId);
  const {
    name,
    price,
    image,
    category,
    rating,
    description,
    specs,
    sizes,
    images,
    stock,
  } = req.body;

  try {
    const productData = {
      name,
      price: parseFloat(price),
      image,
      category,
      rating: parseFloat(rating),
      description,
      specs: Array.isArray(specs) ? specs : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      images: Array.isArray(images) ? images : [image],
      stock: parseInt(stock),
    };

    const result = await ProductService.updateProduct(productId, productData);
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    await ProductService.deleteProduct(productId);
    res.status(200).send("Product deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
