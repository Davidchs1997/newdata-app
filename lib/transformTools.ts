export function normalizeData(data: any[]): any[] {
  return data.map(row => {
    const normalizedRow: any = {};
    for (const key in row) {
      const value = row[key];
      normalizedRow[key] = typeof value === "string" ? value.toLowerCase().trim() : value;
    }
    return normalizedRow;
  });
}

export function encodeCategorical(data: any[]): any[] {
  const encoders: Record<string, Map<string, number>> = {};
  let currentId = 1;

  return data.map(row => {
    const encodedRow: any = {};
    for (const key in row) {
      const value = row[key];
      if (typeof value === "string") {
        if (!encoders[key]) encoders[key] = new Map();
        if (!encoders[key].has(value)) {
          encoders[key].set(value, currentId++);
        }
        encodedRow[key] = encoders[key].get(value);
      } else {
        encodedRow[key] = value;
      }
    }
    return encodedRow;
  });
}

export function replaceText(data: any[]): any[] {
  return data.map(row => {
    const replacedRow: any = {};
    for (const key in row) {
      replacedRow[key] =
        typeof row[key] === "string"
          ? row[key].replace(/foo/gi, "bar") // ejemplo
          : row[key];
    }
    return replacedRow;
  });
}
