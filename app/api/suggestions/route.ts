import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ suggestions: ["No file received."] }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const suggestions: string[] = [];

  if (jsonData.length === 0) {
    suggestions.push("The dataset is empty.");
  } else {
    const firstRow = jsonData[0];
    const numCols = Object.keys(firstRow).length;
    const numRows = jsonData.length;

    if (numCols < 2) suggestions.push("The dataset has very few columns. Consider verifying structure.");
    if (numRows > 1000) suggestions.push("The dataset is large. Consider analyzing performance or summarizing it.");

    const duplicateCheck = new Set();
    let hasDuplicates = false;
    for (let row of jsonData) {
      const key = JSON.stringify(row);
      if (duplicateCheck.has(key)) {
        hasDuplicates = true;
        break;
      }
      duplicateCheck.add(key);
    }

    if (hasDuplicates) suggestions.push("There are duplicate rows. Consider removing them.");

    let hasEmptyCells = false;
    for (let row of jsonData) {
      if (Object.values(row).some(val => val === "")) {
        hasEmptyCells = true;
        break;
      }
    }

    if (hasEmptyCells) suggestions.push("There are empty cells. You may want to clean or fill missing data.");
  }

  return NextResponse.json({ suggestions });
}
