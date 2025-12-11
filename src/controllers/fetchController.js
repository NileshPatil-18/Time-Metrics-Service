import { queryApi } from "../config/influx.js";

/** helpers **/

// returns true for duration like: -1h, 5m, 30s, 1d, etc.
const isDuration = (v) => /^-?\d+[smhdw]$/.test(String(v).trim());

// returns true for ISO-like datetime (basic check)
const isIsoDatetime = (v) => {
  if (!v) return false;
  // rough check for 4-digit year and 'T'
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(String(v));
};


const fluxTime = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (isDuration(s)) return s; // no quotes
  if (isIsoDatetime(s)) return `time(v: ${JSON.stringify(s)})`; 
  return `time(v: ${JSON.stringify(s)})`;
};

/** fetchRaw */
export const fetchRaw = async (req, res) => {
  try {
    const { deviceId } = req.query;
    let { start = "-1h", end } = req.query;

    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    const startFlux = fluxTime(start);
    const endFlux = fluxTime(end);

  
    const rangeClause = endFlux ? `range(start: ${startFlux}, stop: ${endFlux})` : `range(start: ${startFlux})`;

    const flux = `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> ${rangeClause}
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"])
    `;

    const rows = await queryApi.collectRows(flux);
    res.json(rows);
  } catch (err) {
    console.error("fetchRaw error:", err);
    res.status(500).json({ error: err?.message || "Query error" });
  }
};


export const fetchAggregated = async (req, res) => {
  try {
    const { deviceId } = req.query;
    let { start = "-24h", end, window = "1m",fn = "mean" } = req.query;

    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });
    const allowedFns = ["mean", "max", "min", "sum", "count"];
    const aggregationFn = fn.toLowerCase();

    if (!allowedFns.includes(aggregationFn)) {
      return res.status(400).json({ 
        error: `Unsupported aggregation function. Allowed: ${allowedFns.join(", ")}`,
        received: fn
      });
    }

    
    const startFlux = fluxTime(start);
    const endFlux = fluxTime(end);
    const rangeClause = endFlux ? `range(start: ${startFlux}, stop: ${endFlux})` : `range(start: ${startFlux})`;

    // validate & format window: must be a duration literal like 1m, 30s, 1h, 1d
    const windowTrim = String(window).trim();
    if (!/^\d+[smhdw]$/.test(windowTrim)) {
      return res.status(400).json({ error: "window must be like '1m', '30s', '1h', '1d' (no quotes)" });
    }

    
    const windowFlux = windowTrim;

    const flux = `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> ${rangeClause}
        |> filter(fn: (r) => r.deviceId == "${deviceId}")
        |> aggregateWindow(every: ${windowFlux}, fn: ${aggregationFn}, createEmpty: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"])
    `;
    console.log('Aggregated Flux Query:', flux)

    const rows = await queryApi.collectRows(flux);
    res.json(rows);
  } catch (err) {
    console.error("fetchAggregated error:", err);
    res.status(500).json({ error: err?.message || "Query error" });
  }
};
