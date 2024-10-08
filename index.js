//-------------- PACKAGES----------
import path from "path";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// ----------Utilities-----------
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

// const allowedOrigins = [
//     "http://localhost:5173",
//     "https://ecommerce-teal-nu.vercel.app",
// ];

// app.use(
//     cors({
//         origin: function (origin, callback) {
//             if (allowedOrigins.includes(origin) || !origin) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         credentials: true,
//     })
// );

// app.use((req, res, next) => {
//     res.header(
//         "Access-Control-Allow-Origin",
//         "https://ecommerce-teal-nu.vercel.app"
//     );
//     res.header("Access-Control-Allow-Credentials", "true");
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/config/paypal", (req, res) => {
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(port, () => console.log(`Server running on port : ${port}`));
