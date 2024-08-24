import dotenv from "dotenv"
import  express  from "express";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongodb.js";

dotenv.config();
const app = express();
const PORT=process.env.PORT || 5000
app.use("/api/auth",authRoutes)

app.listen(PORT,()=>{
console.log(`Server is running on ${PORT}`)
connectMongoDB();
})