import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export function exportToExcel(data: any[], outputPath: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, outputPath);
}

export function exportStatisticsToExcel(stats: Record<string, any>, outputPath: string): void {
  const rows = Object.entries(stats).map(([key, value]) => ({
    Column: key,
    ...value,
  }));

  exportToExcel(rows, outputPath);
}

export function exportToZip(files: { [filename: string]: string }, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", err => reject(err));

    archive.pipe(output);

    for (const [name, filePath] of Object.entries(files)) {
      archive.file(filePath, { name });
    }

    archive.finalize();
  });
}
