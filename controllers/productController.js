import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const addProduct = asyncHandler(async (req, res) => {
    try {
        const { name, brand, description, price, category, quantity } =
            req.fields;

        // Validation
        switch (true) {
            case !name:
                return res.json({ error: "Name is required" });
            case !brand:
                return res.json({ error: "Brand is required" });
            case !description:
                return res.json({ error: "Description is required" });
            case !price:
                return res.json({ error: "Price is required" });
            case !category:
                return res.json({ error: "Category is required" });
            case !quantity:
                return res.json({ error: "Quantity is required" });
        }

        const product = new Product({ ...req.fields });
        await product.save();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json(error.message);
    }
});

const updateProductDetails = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            quantity,
            brand,
            countInStock,
        } = req.fields;

        // Create an object with only the fields that are present in the request
        const updateFields = {};

        if (name !== undefined) updateFields.name = name;
        if (description !== undefined) updateFields.description = description;
        if (price !== undefined) updateFields.price = price;
        if (category !== undefined) updateFields.category = category;
        if (quantity !== undefined) updateFields.quantity = quantity;
        if (brand !== undefined) updateFields.brand = brand;
        if (countInStock !== undefined)
            updateFields.countInStock = countInStock;

        // Update the product with the specified fields
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

const removeProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

const fetchProducts = asyncHandler(async (req, res) => {
    try {
        const pageSize = 6; //6 products will be fetched

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: "i",
                  },
              }
            : {};

        const count = await Product.countDocuments({ ...keyword });
        const products = await Product.find({ ...keyword }).limit(pageSize);

        res.json({
            products,
            page: 1,
            pages: Math.ceil(count / pageSize),
            hasMore: false,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

const fetchProductById = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            return res.json(product);
        } else {
            res.status(404);
            throw new Error("Product not found");
        }
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: "Product not found" });
    }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({})
            .populate("category")
            .limit(12)
            .sort({ createAt: -1 });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

const addProductReview = asyncHandler(async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400);
                throw new Error("Product already reviewed");
            }

            const review = {
                name: req.user.username,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: "Review added" });
        } else {
            res.status(404);
            throw new Error("Product not found");
        }
    } catch (error) {
        console.error(error);
        res.status(400).json(error.message);
    }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({}).sort({ rating: -1 }).limit(4);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(400).json(error.message);
    }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(5);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(400).json(error.message);
    }
});

const filterProducts = asyncHandler(async (req, res) => {
    try {
        const { checked, radio } = req.body;

        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

        const products = await Product.find(args);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

export {
    addProduct,
    updateProductDetails,
    removeProduct,
    fetchProducts,
    fetchProductById,
    fetchAllProducts,
    addProductReview,
    fetchTopProducts,
    fetchNewProducts,
    filterProducts,
};
