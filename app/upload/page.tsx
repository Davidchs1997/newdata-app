"use client";

import React from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

export default function UploadPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Upload Your File</h1>

      <input type="file" className="mb-4" />

      <div className="space-y-2 mb-4">
        <Checkbox label="Remove empty rows" />
        <Checkbox label="Remove duplicates" />
        <Checkbox label="Analyze statistics" />
        <Checkbox label="Download Trash" />
      </div>

      <Button>Clean and Analyze</Button>
    </div>
  );
}
