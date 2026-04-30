import Papa from "papaparse";

export async function fetchCertificates() {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7JG1T2eVQudLbcaLlFfoFaN9mQB1n6nPLFi8rljUBoiKgP7ebrFHirKiSiPlm9ne3yX4u-831BwjB/pub?gid=1711350204&single=true&output=csv";

  const response = await fetch(SHEET_URL);
  const text = await response.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      complete: (results: any) => resolve(results.data),
    });
  });
}