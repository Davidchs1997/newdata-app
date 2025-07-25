import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center space-x-2 ${className}`}>
      <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" {...props} />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
