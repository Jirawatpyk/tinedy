/**
 * Generates and triggers a browser download for a CSV file from an array of objects.
 * @param filename - The desired filename for the downloaded file (e.g., "report.csv").
 * @param headers - An array of objects defining the CSV headers, with `key` for data access and `label` for the column name.
 * @param data - An array of objects representing the rows of data.
 */
export const exportToCsv = (filename: string, headers: { key: string; label: string }[], data: any[]) => {
  if (!data || data.length === 0) {
    console.error("No data available to export.");
    return;
  }

  const csvRows = [];
  // Add header row using the 'label' from the headers array
  csvRows.push(headers.map(h => `"${h.label}"`).join(','));

  // Add data rows by mapping data objects using the 'key' from the headers array
  for (const row of data) {
    const values = headers.map(header => {
      // Handle null/undefined values and escape double quotes inside the data
      const escaped = ('' + (row[header.key] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
