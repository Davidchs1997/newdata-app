import * as React from "react"

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange
}) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}
