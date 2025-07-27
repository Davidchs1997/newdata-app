'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('File uploaded successfully.');
        setFile(null);
      } else {
        setMessage('Failed to upload file.');
      }
    } catch (error) {
      setMessage('Error uploading file.');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
