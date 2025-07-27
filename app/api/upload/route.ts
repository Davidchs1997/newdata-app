import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false });

  const uploadsDir = path.join(process.cwd(), "/uploads");
  await mkdir(uploadsDir, { recursive: true });

  const data = await new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) reject(err);

      const file = files.file[0];
      const filePath = path.join(uploadsDir, file.originalFilename!);
      await writeFile(filePath, await file.toBuffer());

      resolve({ filePath });
    });
  });

  return NextResponse.json(data);
}
