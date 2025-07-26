// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import * as XLSX from 'xlsx';
import * as pdfkit from 'pdfkit';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import os from 'os';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const options = JSON.parse(formData.get('options') as string);

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempDir = join(os.tmpdir(), uuidv4());
  await mkdir(tempDir, { recursive: true });

  const zip = new JSZip();
  const zipFileName = 'processed_data.zip';

  try {
    // Load file with XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json<any>(worksheet, { defval: null });

    const trash: any[] = [];
    const initialLength = data.length;

    // Limpieza de datos
    if (options.removeEmptyRows) {
      const before = data.length;
      data = data.filter((row: any) => Object.values(row).some(v => v !== null && v !== ''));
      if (options.downloadTrash) trash.push(...data.slice(before));
    }

    if (options.removeEmptyColumns) {
      const allKeys = new Set(data.flatMap(obj => Object.keys(obj)));
      const keysToRemove = Array.from(allKeys).filter(
        key => data.every(row => row[key] === null || row[key] === '')
      );
      data = data.map(row => {
        keysToRemove.forEach(key => delete row[key]);
        return row;
      });
      if (options.downloadTrash) trash.push({ removedColumns: keysToRemove });
    }

    if (options.dropNulls) {
      const before = data.length;
      data = data.filter((row: any) => !Object.values(row).includes(null));
      if (options.downloadTrash) trash.push(...data.slice(before));
    }

    if (options.removeDuplicates) {
      const seen = new Set();
      data = data.filter(row => {
        const serialized = JSON.stringify(row);
        if (seen.has(serialized)) return false;
        seen.add(serialized);
        return true;
      });
    }

    // Guardar CSV limpio
    const newSheet = XLSX.utils.json_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Cleaned Data');
    const cleanedExcelBuffer = XLSX.write(newWorkbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
    zip.file('cleaned_data.xlsx', cleanedExcelBuffer);

    // Generar archivo trash
    if (options.downloadTrash && trash.length > 0) {
      const trashSheet = XLSX.utils.json_to_sheet(trash);
      const trashWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(trashWorkbook, trashSheet, 'Trash');
      const trashBuffer = XLSX.write(trashWorkbook, { bookType: 'xlsx', type: 'buffer' });
      zip.file('trash.xlsx', trashBuffer);
    }

    // Generar estadísticas si se pide
    if (options.analyzeStatistics) {
      const stats: any = {};
      const keys = Object.keys(data[0] || {});

      if (options.totalCount) {
        stats.totalRows = data.length;
        stats.totalColumns = keys.length;
      }

      if (options.uniqueValues) {
        stats.uniqueValues = {};
        for (const key of keys) {
          stats.uniqueValues[key] = new Set(data.map(row => row[key])).size;
        }
      }

      if (options.basicStats) {
        stats.basicStats = {};
        for (const key of keys) {
          const nums = data.map(row => row[key]).filter((v: any) => typeof v === 'number');
          if (nums.length > 0) {
            nums.sort((a, b) => a - b);
            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            const median = nums[Math.floor(nums.length / 2)];
            stats.basicStats[key] = { mean, median, min: nums[0], max: nums[nums.length - 1] };
          }
        }
      }

      if (options.detectNullsOutliers) {
        stats.nullsOutliers = {};
        for (const key of keys) {
          const column = data.map(row => row[key]);
          const nulls = column.filter(v => v === null).length;
          const nums = column.filter((v: any) => typeof v === 'number');
          const q1 = nums[Math.floor(nums.length * 0.25)];
          const q3 = nums[Math.floor(nums.length * 0.75)];
          const iqr = q3 - q1;
          const outliers = nums.filter(x => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr).length;
          stats.nullsOutliers[key] = { nulls, outliers };
        }
      }

      // Exportar .xlsx
      if (options.exportStats) {
        const statSheet = XLSX.utils.json_to_sheet(
          Object.entries(stats).flatMap(([section, content]) => {
            if (typeof content === 'object') {
              return [{ section }, ...Object.entries(content).map(([k, v]) => ({ key: k, ...v }))];
            } else {
              return [{ [section]: content }];
            }
          })
        );
        const statWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(statWorkbook, statSheet, 'Stats');
        const statsBuffer = XLSX.write(statWorkbook, { bookType: 'xlsx', type: 'buffer' });
        zip.file('stats.xlsx', statsBuffer);
      }

      // Exportar .pdf
      if (options.exportStats) {
        const pdfDoc = new pdfkit();
        const pdfChunks: any[] = [];
        const pdfStream = pdfDoc.pipe(Readable.from(pdfChunks));
        pdfDoc.fontSize(16).text('Statistics Summary', { underline: true });

        for (const [section, content] of Object.entries(stats)) {
          pdfDoc.moveDown().fontSize(14).text(section);
          pdfDoc.moveDown().fontSize(12).text(JSON.stringify(content, null, 2));
        }

        pdfDoc.end();
        const pdfBuffer = await streamToBuffer(pdfDoc);
        zip.file('stats.pdf', pdfBuffer);
      }
    }

    // Enviar ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err: any) => reject(err));
  });
}
