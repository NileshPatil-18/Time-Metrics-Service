import {InfluxDB,Point} from    '@influxdata/influxdb-client';
import dotenv from 'dotenv';
dotenv.config();

const influxDB = new InfluxDB({
    url:process.env.INFLUX_URL,
    token:"HJHzC1LCfglOFOSLBaSmclHBYx7CsEzNtMGAIBL6CvEZjEdYjjy1VZVMEe5B-VrxWGLDStwbBREHuldM8ScfEg==",
});



export const writeApi = influxDB.getWriteApi(
    process.env.INFLUX_ORG,
    process.env.INFLUX_BUCKET,
    'ns'
);

writeApi.useDefaultTags({app:"metrici-backend"});

export const queryApi = influxDB.getQueryApi(process.env.INFLUX_ORG);

export {Point};