// BarberQ Pro - Data Export Engine (PDF, Excel, CSV) - Optimized with Dynamic Imports

/**
 * Export array of records to CSV format
 */
export const exportToCSV = (filename, rows) => {
  if (!rows || !rows.length) return;

  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(','),
    ...rows.map(row => 
      keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export records to Excel file using SheetJS (xlsx)
 * Optimized: xlsx is loaded only when this function is called.
 */
export const exportToExcel = async (filename, data, sheetName = 'Reports') => {
  try {
    // Dynamically import xlsx
    const XLSX = await import('xlsx');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (err) {
    console.error('Excel Export Error:', err);
  }
};

/**
 * Generate PDF Report using jsPDF
 * Optimized: jspdf is loaded only when this function is called.
 */
export const exportToPDF = async (title, headers, data, filename = 'BarberQ_Report') => {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title & Header styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138); // Deep Blue
    doc.text('BarberQ Pro - Queue Management System', 14, 20);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 14, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);

    // Table Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 42, 196, 42);

    let startY = 50;
    const cellWidth = (196 - 14) / headers.length;

    // Draw Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    headers.forEach((h, i) => {
      doc.text(h, 16 + i * cellWidth, startY + 6);
    });

    startY += 10;
    doc.setFont('helvetica', 'normal');

    // Draw Rows
    data.forEach((row, rIdx) => {
      if (startY > 270) {
        doc.addPage();
        startY = 20;
      }

      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, startY - 4, 182, 8, 'F');
      }

      headers.forEach((h, cIdx) => {
        const val = row[h] !== undefined ? String(row[h]) : '';
        doc.text(val.substring(0, 22), 16 + cIdx * cellWidth, startY + 2);
      });

      startY += 8;
    });

    doc.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF Export Error:', err);
  }
};
