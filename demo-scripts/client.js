import axios from "axios";


const base = "http://localhost:5000/api/metrics";


async function runDemo() {
try {
const single = {
deviceId: "sensor-101",
timestamp: new Date().toISOString(),
metrics: { temperature: 25.3, humidity: 60.1 }
};
const r1 = await axios.post(`${base}/ingest`, single);
console.log("Ingest single:", r1.data);


const bulk = [
{ deviceId: "sensor-101", timestamp: new Date().toISOString(), metrics: { temperature: 25.5, humidity: 59.8 } },
{ deviceId: "sensor-101", timestamp: new Date(Date.now()-5000).toISOString(), metrics: { temperature: 25.2, humidity: 60.5 } }
];
const r2 = await axios.post(`${base}/ingest/bulk`, bulk);
console.log("Bulk ingest:", r2.data);


const r3 = await axios.get(`${base}/fetch/raw`, { params: { deviceId: "sensor-101", start: "-1h" }});
console.log("Raw rows count:", Array.isArray(r3.data) ? r3.data.length : 0);


const r4 = await axios.get(`${base}/fetch/aggregated`, { params: { deviceId: "sensor-101", start: "-1h", window: "1m", fn: "mean" }});
console.log("Aggregated rows:", Array.isArray(r4.data) ? r4.data.length : 0);


} catch (err) {
console.error("Demo error:", err.response?.data || err.message);
}
}


runDemo();