import * as React from "react";

export function Button({ onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
