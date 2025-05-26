const express = require('express');
const router = express.Router();
const ProductRequest = require('../models/ProductRequest.model');

router.post('/', async (req, res) => {
  try {
    const product = new ProductRequest(req.body);
    await product.save();
    res.status(200).json({ message: "Product request submitted!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit product request." });
  }
});

module.exports = router;
