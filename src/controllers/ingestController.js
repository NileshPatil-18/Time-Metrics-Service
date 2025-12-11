import {writeApi,Point} from "../config/influx.js";
import {validateRecord} from '../utils/validators.js';

const isValidTimestamp = (t) => {
  if (!t) return false;
  const ms = Date.parse(t);
  return !Number.isNaN(ms);
};

export const ingestSingle = async(req,res)=>{
    try{
        const data = req.body;

             if (!validateRecord(data)) {
      return res.status(400).json({ error: "Invalid payload format" });
    }

    if (!isValidTimestamp(data.timestamp)) {
      return res.status(400).json({ error: "Invalid timestamp" });
    }


        const point = new Point('device_metrics')
        .tag("deviceId",data.deviceId)
        .timestamp(new Date(data.timestamp));

        Object.entries(data.metrics).forEach(([key,value])=>{
            point.floatField(key,value);
        });

        writeApi.writePoint(point);
       try {
           await writeApi.flush();
        } catch (err) {
            console.error("Failed to write to InfluxDB:", err);
            return res.status(503).json({ error: "Database temporarily unavailable" });
        }

        res.status(200).json({message:"Record ingested successfully"});    
    } catch(err){
        console.log("Error:",err);
        return res.status(500).json({error : "Server Error"});
    }
};

export const ingestBulk = async (req, res) => {
  try {
    const records = req.body;

    if (!Array.isArray(records))
      return res.status(400).json({ error: "Array expected" });

    for (let record of records) {
      if (!validateRecord(record))
        return res.status(400).json({ error: "One or more invalid records" });

      const point = new Point("device_metrics")
        .tag("deviceId", record.deviceId)
        .timestamp(new Date(record.timestamp));

      Object.entries(record.metrics).forEach(([key, value]) => {
        point.floatField(key, value);
      });

      writeApi.writePoint(point);
    }

    await writeApi.flush();

    res.status(200).json({ message: "Bulk ingestion successful" });
  } catch (err) {
    console.error("Bulk error:", err);
    res.status(500).json({ error: "Server error" });
  }
};