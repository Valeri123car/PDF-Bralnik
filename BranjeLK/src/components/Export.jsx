import { usePdf } from './PdfContext';
import * as XLSX from 'xlsx';
import { useState } from 'react';

function Export() {
  const { geoPisarna, stevilka, ko, stevilkaElaborata, stTehPos, pi, dopolnitiDo, vodjaPostopka } = usePdf();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState(null); // To store the loaded workbook

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);

      // Read the file and store the workbook
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        setWorkbook(wb); // Store the workbook in state
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const handleDeleteFile = () => {
    setFile(null);
    setFileName("");
    setWorkbook(null); // Clear the workbook
  };

  const exportToExcel = async () => {
    if (!file || !workbook) {
      alert("Najprej naložite Excel datoteko.");
      return;
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (jsonData.length === 0) {
      jsonData.push(["Zap. št", "Geodetska pisarna", "Številka", "K.O", "Št. elaborata", "Št. tehničnega postopka", "P.I", "Dopolniti do", "Vodja postopka"]);
    }

    // Add the new row of data
    const zaporednaStevilka = jsonData.length;
    const newRow = [
      zaporednaStevilka,
      geoPisarna || "",
      stevilka || "",
      ko || "",
      stevilkaElaborata || "",
      stTehPos || "",
      pi || "",
      dopolnitiDo || "",
      vodjaPostopka || ""
    ];

    jsonData.push(newRow);

    // Convert back to worksheet and update the workbook
    const updatedWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    workbook.Sheets[sheetName] = updatedWorksheet;

    // Create a Blob with the updated data
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Create a download link and trigger the download to the same file name
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "exported-data.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="export">
      <div className="export-polje">
        <div>Podatki bodo izvoženi v: {fileName || "Ni datoteke"}</div>
        {file && <button onClick={handleDeleteFile}>X</button>}
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        <button onClick={exportToExcel}>Izvozi podatke</button>
      </div>
    </div>
  );
}

export default Export;
