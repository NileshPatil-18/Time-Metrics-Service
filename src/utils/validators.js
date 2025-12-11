export const validateRecord = (record)=>{
    if(!record.deviceId || !record.timestamp || !record.metrics)
        return false;

    if(typeof record.metrics !== "object") return false;

    for(let key in record.metrics){
        if(typeof record.metrics[key] !== "number") return false;
    }
    return true;
};