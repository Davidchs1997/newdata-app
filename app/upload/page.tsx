'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    setUploadStatus(null);
    setDownloadUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadStatus('Uploading...');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadStatus('File uploaded successfully!');
        setDownloadUrl(data.filePath); // Ruta desde la API
      } else {
        const error = await res.text();
        setUploadStatus(`Upload failed: ${error}`);
      }
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Upload File</h1>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Upload
      </button>

      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}

      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="mt-4 text-blue-500 underline"
        >
          Download File
        </a>
      )}
    </div>
  );
}
