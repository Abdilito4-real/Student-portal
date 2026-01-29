import * as XLSX from 'xlsx';

export interface RawExcelResult {
  email: string;
  subject: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  term: '1st' | '2nd' | '3rd';
  year: number;
  comments?: string;
}

/**
 * Parses an XLSX file and returns an array of result objects.
 * Expected columns: Email, Subject, Grade, Term, Year, Comments (optional)
 */
export async function parseResultsExcel(file: File): Promise<RawExcelResult[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const results = json.map((row: any) => ({
          email: row.Email || row.email,
          subject: row.Subject || row.subject,
          grade: row.Grade || row.grade,
          term: row.Term || row.term,
          year: parseInt(row.Year || row.year),
          comments: row.Comments || row.comments || '',
        }));

        // Basic validation
        const validResults = results.filter(r =>
          r.email && r.subject && r.grade && r.term && !isNaN(r.year)
        );

        resolve(validResults as RawExcelResult[]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
