const Product = require("../models/product");
const mongoose = require("mongoose");
const axios = require('axios');

//Get All Products and Save into db
const getAllProductsAndSaveIntoDB = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.per_page) || 10;
    // const month = req.body.month;
    try {
        const totalCount = await Product.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;



        const existingProducts = await Product.find().skip(skip).limit(limit);



        // If products already exist, send them in the response
        if (existingProducts.length > 0) {

            return res.status(200).json({
                message: "Products already exists",
                savedProducts: existingProducts,
                totalPages,
                totalCount,
                page
            });
        }

        // Fetch data from external API
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const responseProducts = response.data;

        // Save products to MongoDB
        await Product.insertMany(responseProducts);;


        // Apply pagination after filtering
        const savedProducts = await Product.find().skip(skip).limit(limit);

        res.status(200).json({
            savedProducts,
            totalPages,
            totalCount,
            page
        });
    } catch (error) {
        console.error(error);
        res.status(400);
        return next(new Error(error.message));
    }
}

const filteredProductsByTitleOrDescriptionOrPrice = async (req, res, next) => {
    try {
        const { search, month } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
            const parsedSearch = parseFloat(search);
            if (!isNaN(parsedSearch)) {
                query.$or.push({ price: parsedSearch });
            }
        }

        if (month) {
            const existingProducts = await Product.find({});
            const filteredProducts = existingProducts.filter(product => {
                const dateOfSale = new Date(product.dateOfSale);
                return dateOfSale.getMonth() + 1 === parseInt(month); // +1 because getMonth() returns 0-indexed months (0-Jan, 1-Feb, etc.)
            });
            return res.status(200).json(filteredProducts);
        }

        const filteredProducts = await Product.find(query);
        return res.status(200).json(filteredProducts);

    } catch (error) {
        console.error(error);
        res.status(400);
        return next(new Error(error.message));
    }
};


// API for statistics
const getStatisticsForProducts = async (req, res, next) => {
    try {

        const { month } = req.query;

        const pipeline = [
            {
                $addFields: {
                    month: { $month: "$dateOfSale" }
                }
            },
            {
                $match: {
                    month: parseInt(month)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$price" },
                    totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ];
        const result = await Product.aggregate(pipeline);
        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(400);
        return next(new Error(error.message));
    }
};




module.exports = { getAllProductsAndSaveIntoDB, filteredProductsByTitleOrDescriptionOrPrice, getStatisticsForProducts }