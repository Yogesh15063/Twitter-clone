import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongodb.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// Routes
app.use("/api/auth", authRoutes);

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
