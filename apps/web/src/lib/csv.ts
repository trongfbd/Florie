function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowsToCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, content: string): void {
  // Leading UTF-8 BOM (via code point, not a literal source character, to
  // avoid any editor/tool round-trip mangling it) so Excel opens Vietnamese
  // diacritics correctly instead of mojibake — a plain UTF-8 blob with no
  // BOM gets misread as ANSI there.
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
