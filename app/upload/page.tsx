'use client'
import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Papa from 'papaparse'
import JSZip from 'jszip'
import FileSaver from 'file-saver'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [options, setOptions] = useState({
    removeDuplicates: false,
    removeEmptyRows: false,
    removeEmptyColumns: false,
    dropNulls: false,
    downloadTrash: false,
    analyzeStatistics: {
      enabled: false,
      countRowsCols: false,
      uniqueValues: false,
      statsSummary: false,
      detectNullsOutliers: false,
      showSummary: false,
      exportStats: false
    },
    generateCharts: false,
    normalizeData: false,
    encodeCategorical: false,
    transformText: false
  })

  const handleOptionChange = (key: string, value: boolean | object) => {
    if (key === 'analyzeStatistics' && typeof value === 'object') {
      setOptions((prev) => ({
        ...prev,
        analyzeStatistics: {
          ...prev.analyzeStatistics,
          ...value
        }
      }))
    } else {
      setOptions((prev) => ({ ...prev, [key]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const processFile = () => {
    if (!file) return alert('Please select a file.')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: false,
      complete: async (result) => {
        let data = result.data as any[]
        const trash: any[] = []

        const originalLength = data.length

        if (options.removeDuplicates) {
          const seen = new Set()
          data = data.filter((row) => {
            const key = JSON.stringify(row)
            if (seen.has(key)) {
              trash.push(row)
              return false
            }
            seen.add(key)
            return true
          })
        }

        if (options.removeEmptyRows) {
          data = data.filter((row) => {
            const isEmpty = Object.values(row).every((val) => val === '')
            if (isEmpty) trash.push(row)
            return !isEmpty
          })
        }

        if (options.removeEmptyColumns) {
          const keys = Object.keys(data[0])
          const nonEmptyKeys = keys.filter((key) =>
            data.some((row) => row[key] !== '')
          )
          data = data.map((row) => {
            const cleanedRow: any = {}
            nonEmptyKeys.forEach((key) => (cleanedRow[key] = row[key]))
            return cleanedRow
          })
        }

        if (options.dropNulls) {
          data = data.filter((row) => {
            const hasNull = Object.values(row).some((val) => val === null || val === '')
            if (hasNull) trash.push(row)
            return !hasNull
          })
        }

        const csv = Papa.unparse(data)

        const zip = new JSZip()
        zip.file('cleaned_data.csv', csv)

        if (options.downloadTrash && trash.length > 0) {
          const trashCsv = Papa.unparse(trash)
          zip.file('trash.csv', trashCsv)
        }

        const blob = await zip.generateAsync({ type: 'blob' })
        FileSaver.saveAs(blob, 'processed_data.zip')
      }
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Upload and Process Your File</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="space-y-4 mb-6">
        <Checkbox
          label="Remove Duplicates"
          checked={options.removeDuplicates}
          onChange={(val) => handleOptionChange('removeDuplicates', val)}
        />
        <Checkbox
          label="Remove Empty Rows"
          checked={options.removeEmptyRows}
          onChange={(val) => handleOptionChange('removeEmptyRows', val)}
        />
        <Checkbox
          label="Remove Empty Columns"
          checked={options.removeEmptyColumns}
          onChange={(val) => handleOptionChange('removeEmptyColumns', val)}
        />
        <Checkbox
          label="Drop Nulls"
          checked={options.dropNulls}
          onChange={(val) => handleOptionChange('dropNulls', val)}
        />
        <Checkbox
          label="Download Trash"
          checked={options.downloadTrash}
          onChange={(val) => handleOptionChange('downloadTrash', val)}
        />
        <Checkbox
          label="Analyze Statistics"
          checked={options.analyzeStatistics.enabled}
          onChange={(val) =>
            handleOptionChange('analyzeStatistics', { enabled: val })
          }
        />
        {options.analyzeStatistics.enabled && (
          <div className="ml-6 space-y-2">
            <Checkbox
              label="Total row/column count"
              checked={options.analyzeStatistics.countRowsCols}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', { countRowsCols: val })
              }
            />
            <Checkbox
              label="Unique values per column"
              checked={options.analyzeStatistics.uniqueValues}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', { uniqueValues: val })
              }
            />
            <Checkbox
              label="Basic stats (mean, median, etc)"
              checked={options.analyzeStatistics.statsSummary}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', { statsSummary: val })
              }
            />
            <Checkbox
              label="Nulls and outliers detection"
              checked={options.analyzeStatistics.detectNullsOutliers}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', {
                  detectNullsOutliers: val
                })
              }
            />
            <Checkbox
              label="Summary visualization"
              checked={options.analyzeStatistics.showSummary}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', { showSummary: val })
              }
            />
            <Checkbox
              label="Export stats (.xlsx and .pdf)"
              checked={options.analyzeStatistics.exportStats}
              onChange={(val) =>
                handleOptionChange('analyzeStatistics', { exportStats: val })
              }
            />
          </div>
        )}
      </div>

      <Button onClick={processFile}>Upload & Process</Button>
    </div>
  )
}
