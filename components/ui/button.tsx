import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${className}`}
      {...props}
    />
  );
}
