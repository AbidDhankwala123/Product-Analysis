const express = require("express");
const { getAllProductsAndSaveIntoDB, filteredProductsByTitleOrDescriptionOrPrice, getStatisticsForProducts } = require("../controllers/productController");
const router = express.Router();

router.get("/", getAllProductsAndSaveIntoDB);//Get All Products and Save into db
router.get("/filter_products", filteredProductsByTitleOrDescriptionOrPrice); // API to filter products based on title, description, or price
router.get("/statistics", getStatisticsForProducts);

module.exports = router
