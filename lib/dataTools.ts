import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import os from "os";
import { removeEmptyRows, removeDuplicates, extractTrashRows } from "./cleaningTools";
import { normalizeData, encodeCategorical, replaceText } from "./transformTools";
import { generateStatistics } from "./analysisTools";
import { exportToExcel, exportToZip, exportStatisticsToExcel } from "./exportTools";

export async function processExcelFile(
  filePath: string,
  fields: Record<string, string>
): Promise<{
  cleanedFilePath?: string;
  trashFilePath?: string;
  statsFilePath?: string;
}> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  let sheet = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], { defval: "" });

  const trash: any[] = [];
  let statsFilePath;
  let cleanedFilePath;
  let trashFilePath;

  // === 1. LIMPIEZA DE DATOS ===

  if (fields.removeEmptyRows === "true") {
    const [cleaned, removed] = removeEmptyRows(sheet, fields.onlyWhitespace === "true");
    sheet = cleaned;
    trash.push(...removed);
  }

  if (fields.removeDuplicates === "true") {
    const [cleaned, duplicates] = removeDuplicates(sheet);
    sheet = cleaned;
    trash.push(...duplicates);
  }

  // === 2. TRANSFORMACIONES ===

  if (fields.normalize === "true") {
    sheet = normalizeData(sheet);
  }

  if (fields.encodeCategorical === "true") {
    sheet = encodeCategorical(sheet);
  }

  if (fields.replaceText === "true") {
    sheet = replaceText(sheet); // puedes ajustar esto para que reciba reglas en el futuro
  }

  // === 3. ANÁLISIS ESTADÍSTICO ===

  if (fields.analyzeStatistics === "true") {
    const stats = generateStatistics(sheet);
    const statsFilename = `statistics_${Date.now()}.xlsx`;
    const statsPath = path.join(os.tmpdir(), statsFilename);
    exportStatisticsToExcel(stats, statsPath);
    statsFilePath = statsPath;
  }

  // === 4. EXPORTAR ARCHIVOS ===

  if (fields.downloadTrash === "true" && trash.length > 0) {
    const trashFilename = `trash_${Date.now()}.xlsx`;
    const trashPath = path.join(os.tmpdir(), trashFilename);
    exportToExcel(trash, trashPath);
    trashFilePath = trashPath;
  }

  const cleanedFilename = `cleaned_${Date.now()}.xlsx`;
  const cleanedPath = path.join(os.tmpdir(), cleanedFilename);
  exportToExcel(sheet, cleanedPath);
  cleanedFilePath = cleanedPath;

  return { cleanedFilePath, trashFilePath, statsFilePath };
}
