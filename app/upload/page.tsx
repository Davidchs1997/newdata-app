"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [downloadTrash, setDownloadTrash] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    console.log("Uploaded file:", file.name);
    console.log("Remove duplicates:", removeDuplicates);
    console.log("Remove empty rows:", removeEmpty);
    console.log("Download trash:", downloadTrash);
    // Aquí irá la lógica de limpieza y análisis
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-semibold mb-6">Upload Your File</h1>

      <input
        type="file"
        accept=".csv, .xlsx, .xls, .json"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="space-y-2 mb-6">
        <Checkbox
          checked={removeDuplicates}
          onChange={() => setRemoveDuplicates(!removeDuplicates)}
        >
          Remove duplicate rows
        </Checkbox>

        <Checkbox
          checked={removeEmpty}
          onChange={() => setRemoveEmpty(!removeEmpty)}
        >
          Remove empty rows
        </Checkbox>

        <Checkbox
          checked={downloadTrash}
          onChange={() => setDownloadTrash(!downloadTrash)}
        >
          Download Trash (removed data)
        </Checkbox>
      </div>

      <Button onClick={handleSubmit}>Submit</Button>
    </main>
  );
}
