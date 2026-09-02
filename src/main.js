import express from "express";
import cors from "cors";
import multer from "multer";

const upload = multer({ dest: 'uploads/' }); 
const app = express();

app.use(cors())
    ; app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({status: "success", message: "Hello World!"})
})

app.post("/api/evaluate", upload.any(), (req, res) => {
    console.log(req.files)
    res.status(200).json({status: "success", data: {
        score: 55,
        suggestions: ['Add more keywords', 'Fix typo in experience']
    }})
})


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

export default app;