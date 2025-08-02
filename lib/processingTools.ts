import archiver from "archiver";
import { Readable } from "stream";

export async function createZipWithResults(
  cleanedFile: Buffer,
  trashFile: Buffer | null,
  statsFile: Buffer | null,
  chartsFile: Buffer | null,
  format: string
): Promise<Readable> {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const zipStream = new Readable({
    read() {},
  });

  archive.on("data", (chunk) => zipStream.push(chunk));
  archive.on("end", () => zipStream.push(null));
  archive.on("error", (err) => {
    throw err;
  });

  archive.append(cleanedFile, { name: `CleanedData.${format}` });

  if (trashFile) {
    archive.append(trashFile, { name: `Trash.${format}` });
  }

  if (statsFile) {
    archive.append(statsFile, { name: `Statistics.${format}` });
  }

  if (chartsFile) {
    archive.append(chartsFile, { name: `Charts.zip` });
  }

  archive.finalize();

  return zipStream;
}
