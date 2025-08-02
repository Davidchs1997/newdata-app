export function removeEmptyRows(data: any[], onlyWhitespace = false): [any[], any[]] {
  const cleaned = [];
  const removed = [];

  for (const row of data) {
    const values = Object.values(row);
    const isEmpty = onlyWhitespace
      ? values.every(val => typeof val === "string" && val.trim() === "")
      : values.every(val => val === null || val === "");

    if (isEmpty) {
      removed.push(row);
    } else {
      cleaned.push(row);
    }
  }

  return [cleaned, removed];
}

export function removeDuplicates(data: any[]): [any[], any[]] {
  const seen = new Set();
  const unique = [];
  const duplicates = [];

  for (const row of data) {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicates.push(row);
    } else {
      seen.add(key);
      unique.push(row);
    }
  }

  return [unique, duplicates];
}
