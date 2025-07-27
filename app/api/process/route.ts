import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as XLSX from "xlsx";
import { PDFDocument, rgb } from "pdf-lib";
import archiver from "archiver";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { operations, filePath } = await req.json();

  const fileContent = await readFile(filePath);
  const workbook = XLSX.read(fileContent, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let cleanedData = data;

  if (operations.removeEmptyRows) {
    cleanedData = cleanedData.filter((row) =>
      Object.values(row).some((value) => value !== null && value !== "")
    );
  }

  if (operations.removeDuplicates) {
    cleanedData = cleanedData.filter(
      (row, index, self) =>
        index ===
        self.findIndex((r) =>
          JSON.stringify(r) === JSON.stringify(row)
        )
    );
  }

  const outputPath = path.join(process.cwd(), "output");
  const outputFile = path.join(outputPath, "cleaned.xlsx");

  const newWorkbook = XLSX.utils.book_new();
  const newSheet = XLSX.utils.json_to_sheet(cleanedData);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Cleaned");
  await mkdir(outputPath, { recursive: true });
  XLSX.writeFile(newWorkbook, outputFile);

  return NextResponse.json({ cleanedFilePath: outputFile });
}
