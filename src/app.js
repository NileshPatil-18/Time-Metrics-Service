import express from "express";
import metricsRoutes from "./routes/metricRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/metrics',metricsRoutes);


app.get('/',(req,res)=>{
    res.end("Time-series Metrics API is running...");
});

export default app;