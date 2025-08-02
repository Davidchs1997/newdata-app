// components/SmartSuggestions.tsx
"use client";

import React, { useEffect, useState } from "react";

interface SmartSuggestionsProps {
  file: File | null;
}

export default function SmartSuggestions({ file }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!file) return;

    const fetchSuggestions = async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/suggestions", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } else {
        console.error("Failed to fetch suggestions");
      }
    };

    fetchSuggestions();
  }, [file]);

  if (!file) return null;

  return (
    <div className="bg-gray-100 border border-gray-300 rounded p-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Smart Suggestions</h2>
      {suggestions.length === 0 ? (
        <p className="text-gray-600">Analyzing file for suggestions...</p>
      ) : (
        <ul className="list-disc list-inside text-gray-800">
          {suggestions.map((sug, idx) => (
            <li key={idx}>{sug}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
