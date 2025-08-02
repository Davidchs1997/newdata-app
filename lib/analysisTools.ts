export function generateStatistics(data: any[]): Record<string, any> {
  if (data.length === 0) return {};

  const stats: Record<string, any> = {};
  const columns = Object.keys(data[0]);

  for (const col of columns) {
    const values = data.map(row => row[col]).filter(val => typeof val === "number");
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const std =
        Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length);

      stats[col] = { count: values.length, avg, min, max, std };
    } else {
      const unique = new Set(data.map(row => row[col]));
      stats[col] = { type: "non-numeric", uniqueValues: unique.size };
    }
  }

  return stats;
}
