import {writeApi,Point} from "../config/influx.js";
import {validateRecord,isValidTimestamp} from '../utils/validators.js';


export const ingestSingle = async(req,res)=>{
    try{
        const data = req.body;

        if (!validateRecord(data)) {
            return res.status(400).json({
               error: "Invalid payload format" 
            });
    }

    if (!isValidTimestamp(data.timestamp)) {
      return res.status(400).json({ error: "Invalid timestamp" });
    }
       const timestamp = new Date(data.timestamp.trim());

        const point = new Point('device_metrics')
        .tag("deviceId",data.deviceId)
        .timestamp(timestamp);

        Object.entries(data.metrics).forEach(([key,value])=>{
            point.floatField(key,value);
        });

        writeApi.writePoint(point);
       try {
           await writeApi.flush();
           res.status(200).json({ 
                message: "Record ingested successfully",
                deviceId: data.deviceId,
                timestamp: data.timestamp
            });
        } catch (err) {
            console.error("Failed to write to InfluxDB:", err);
            return res.status(503).json({
               error: "Database temporarily unavailable"
               });
        }

    } catch(err){
        console.log("Error:",err);
        return res.status(500).json({error : "Server Error"});
    }
};

export const ingestBulk = async (req, res) => {
    try {
        const records = req.body;
        if (!Array.isArray(records)) {
          return res.status(400).json({ error: "Array expected" })
        };

        if (records.length === 0) {
            return res.status(400).json({ error: "Empty array provided" });
        }

        const points = [];
        for (let record of records) {
            if (!validateRecord(record)) {
                return res.status(400).json({ error: "Invalid record found" });
            }
            const timestamp = new Date(record.timestamp.trim());
            const point = new Point("device_metrics")
                .tag("deviceId", record.deviceId)
                .timestamp(timestamp);
            Object.entries(record.metrics).forEach(([key, value]) => {
                point.floatField(key, value);
            });
            points.push(point);
        }

        points.forEach(p => writeApi.writePoint(p));
        await writeApi.flush();
        res.status(200).json({ message: "Bulk ingestion successful" });
    } catch (err) {
        console.error("Bulk error:", err);
        res.status(500).json({ error: "Server error" });
    }
};