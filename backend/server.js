import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary"

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";


import connectMongoDB from "./db/connectMongodb.js";


dotenv.config();
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Connect to MongoDB and start the server
connectMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error.message);
  });
