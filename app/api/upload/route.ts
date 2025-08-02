import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";
import { pipeline } from "stream";
import Busboy from "busboy";
import * as XLSX from "xlsx";

import { removeEmptyRows, removeDuplicates } from "@/lib/cleaningTools";
import { normalizeData, encodeCategorical, replaceText } from "@/lib/transformTools";
import { generateStatistics } from "@/lib/analysisTools";
import { exportToExcel, exportStatisticsToExcel, exportToZip } from "@/lib/exportTools";

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
  try {
    const boundary = req.headers.get("content-type")?.split("boundary=")[1];
    if (!boundary) {
      return NextResponse.json({ error: "No multipart boundary found" }, { status: 400 });
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpDir = os.tmpdir();
    const fields: Record<string, any> = {};
    let uploadedFilePath = "";

    const parsePromise = new Promise<void>((resolve, reject) => {
      busboy.on("file", (_, file, info) => {
        const filename = `${uuidv4()}-${info.filename}`;
        uploadedFilePath = path.join(tmpDir, filename);
        const saveTo = fs.createWriteStream(uploadedFilePath);
        file.pipe(saveTo);
      });

      busboy.on("field", (key, value) => {
        fields[key] = value;
      });

      busboy.on("finish", () => resolve());
      busboy.on("error", err => reject(err));
    });

    await pump(req.body!, busboy);
    await parsePromise;

    // Leer archivo
    const workbook = XLSX.readFile(uploadedFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = XLSX.utils.sheet_to_json(sheet);

    const trash: any[] = [];

    // Limpieza
    if (fields.removeEmptyRows === "true") {
      const [cleaned, removed] = removeEmptyRows(jsonData, fields.onlyWhitespace === "true");
      jsonData = cleaned;
      if (fields.downloadTrash === "true") trash.push(...removed);
    }

    if (fields.removeDuplicates === "true") {
      const [unique, duplicates] = removeDuplicates(jsonData);
      jsonData = unique;
      if (fields.downloadTrash === "true") trash.push(...duplicates);
    }

    // Transformaciones
    if (fields.transform === "true") {
      if (fields.normalize === "true") jsonData = normalizeData(jsonData);
      if (fields.encodeCategorical === "true") jsonData = encodeCategorical(jsonData);
      if (fields.replaceText === "true") jsonData = replaceText(jsonData);
    }

    // Estadísticas
    let stats = null;
    if (fields.analyze === "true") {
      stats = generateStatistics(jsonData);
    }

    // Preparar exportaciones
    const outputDir = path.join(tmpDir, uuidv4());
    fs.mkdirSync(outputDir);

    const cleanedPath = path.join(outputDir, "cleaned.xlsx");
    exportToExcel(jsonData, cleanedPath);

    let statsPath = "";
    if (stats && fields.exportStats === "true") {
      statsPath = path.join(outputDir, `statistics.${fields.exportFormat === "pdf" ? "pdf" : "xlsx"}`);
      exportStatisticsToExcel(stats, statsPath);
    }

    let trashPath = "";
    if (fields.downloadTrash === "true" && trash.length > 0) {
      trashPath = path.join(outputDir, "trash.xlsx");
      exportToExcel(trash, trashPath);
    }

    // Generar ZIP final
    const zipPath = path.join(tmpDir, `${uuidv4()}.zip`);
    const zipFiles: Record<string, string> = {
      "cleaned.xlsx": cleanedPath,
    };

    if (statsPath) zipFiles[path.basename(statsPath)] = statsPath;
    if (trashPath) zipFiles["trash.xlsx"] = trashPath;

    await exportToZip(zipFiles, zipPath);
    const zipBuffer = fs.readFileSync(zipPath);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="results.zip"',
      },
    });
  } catch (error) {
    console.error("Error en API /upload:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
