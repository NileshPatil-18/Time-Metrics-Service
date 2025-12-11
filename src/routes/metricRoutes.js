import express from "express";
import { ingestSingle, ingestBulk } from "../controllers/ingestController.js";
import { fetchRaw, fetchAggregated } from "../controllers/fetchController.js";

const router = express.Router();

router.post("/ingest", ingestSingle);
router.post("/ingest/bulk", ingestBulk);

router.get("/fetch/raw", fetchRaw);
router.get("/fetch/aggregated", fetchAggregated);

export default router;
