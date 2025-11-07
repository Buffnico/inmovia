import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/ping", (req,res)=>res.json({ok:true, app:"inmovia-api"}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>console.log(`[API] http://localhost:${PORT}`));

const eduRouter = require("./routes/edu");
app.use("/api/edu", eduRouter);
