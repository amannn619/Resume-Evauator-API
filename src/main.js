import express from "express";
import authRouter from "./routes/authRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import cors from "cors";
import fs from "fs";
import SwaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}

const swaggerDoc = JSON.parse(fs.readFileSync("./swagger-output.json", 'utf-8'));
const app = express();
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDoc));

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({status: "success", message: "Hello World!"})
})

app.use("/api/auth", authRouter);

app.use("/api/resume", resumeRouter )

app.use((req, res) => {
    res.status(404).json({ status: "error", error: "Page not found." });
})

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

export default app;