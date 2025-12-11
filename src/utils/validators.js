export const validateRecord = (record)=>{
    if(!record.deviceId || !record.timestamp || !record.metrics)
        return false;

    if(typeof record.metrics !== "object") return false;

    
    return true;
};