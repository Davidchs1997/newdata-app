import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <label className="flex items-center space-x-2">
      <input type="checkbox" {...props} className="form-checkbox" />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
