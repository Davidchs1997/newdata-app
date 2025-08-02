import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ChartConfiguration } from "chart.js";

export async function generateGraphs(data: any[], chartOptions: any) {
  const width = 800;
  const height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const buffers: Record<string, Buffer> = {};

  for (const column of chartOptions.columns || []) {
    const values = data.map((row) => row[column]);
    const labels = values.map((_, index) => `Row ${index + 1}`);

    const configuration: ChartConfiguration = {
      type: chartOptions.type || "bar",
      data: {
        labels,
        datasets: [
          {
            label: column,
            data: values,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true },
        },
      },
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    buffers[`${column}_chart.png`] = buffer;
  }

  return buffers;
}
