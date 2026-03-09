export const processDataForChart = (data) => {
    if (!data || data.length === 0)
        return [{ time: "N/A", value: 0, numericValue: 0 }];

    // Mappatura dei nuovi stati
    const stateMap = {
        DEPRESSURIZING: 0,
        IDLE: 1,
        PRESSURIZING: 2
    };

    return data.map(d => {
        let numericValue = d.value;

        if (typeof d.value === "string") {
            const valUpper = d.value.toUpperCase();

            // Gestione nuovi stati categorici
            if (stateMap.hasOwnProperty(valUpper)) {
                numericValue = stateMap[valUpper];
            }
            // Gestione booleani Open/Closed
            else if (valUpper === "OPEN") {
                numericValue = 1;
            } else if (valUpper === "CLOSED") {
                numericValue = 0;
            }
            // Fallback per altri casi stringa
            else {
                numericValue = 0;
            }
        }

        return {
            ...d,
            time: new Date(d.timestamp).toLocaleTimeString(),
            numericValue,
            originalValue: d.value
        };
    });
};