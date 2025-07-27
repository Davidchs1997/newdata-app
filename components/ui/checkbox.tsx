import React from "react";

export function Checkbox({ label, value, onChange }: any) {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        value={value}
        onChange={(e) => onChange(value, e.target.checked)}
        className="w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}
