export const processDataForChart = (data) => {
    if (!data || data.length === 0) return [{ time: "N/A", value: 0 }];

    return data.map(d => {
        let numericValue = d.value;

        // Se è una stringa booleano tipo Open/Closed -> mappiamo a 1/0
        if (typeof d.value === "string") {
            if (d.value.toLowerCase() === "open") numericValue = 1;
            else if (d.value.toLowerCase() === "closed") numericValue = 0;
            else numericValue = 0; // default fallback
        }

        return {
            ...d,
            time: new Date(d.timestamp).toLocaleTimeString(),
            numericValue,
            originalValue: d.value,
        };
    });
};