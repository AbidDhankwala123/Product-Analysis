const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middleware/errorMiddleware");
require("dotenv").config();

const app = express();

//health check
app.get("/", (req, res) => {
    res.status(200).json({
        service: "Product Application",
        status: "ACTIVE",
        time: new Date(),
    })
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/api/products",require("./routes/productRoutes"));

//Handling Error Midddleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log(`Server running successfully on http://localhost:${process.env.PORT}`))
        .catch(error => console.log(error))
})
