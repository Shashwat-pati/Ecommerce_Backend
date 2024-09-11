import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    console.log(token);

    // Set JWT as HTTP-only Cookie
    res.cookie("jwt", token, {
        domain: "https://ecommerce-backend-mauve-six.vercel.app",
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export default generateToken;
