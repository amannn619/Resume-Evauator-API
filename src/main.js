import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({status: "success", message: "Hello World!"})
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

export default app;