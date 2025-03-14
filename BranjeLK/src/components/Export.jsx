import { usePdf } from './PdfContext';
import * as XLSX from 'xlsx';
import { useState } from 'react';

function Export() {
  const { geoPisarna, stevilka, ko, stevilkaElaborata, stTehPos, pi, dopolnitiDo, vodjaPostopka } = usePdf();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("Zbirka_struktura.xlsx"); // Fixed file name

    

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name); // Or just keep it fixed as above.
    }
  };

  const handleDeleteFile = () => {
    setFile(null);
    setFileName("");
  };

  const exportToExcel = async () => {
    if (!file) {
      alert("Najprej naložite Excel datoteko.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        jsonData.push(["Zap. št", "Geodetska pisarna", "Številka", "K.O", "Št. elaborata", "Št. tehničnega postopka", "P.I", "Dopolniti do", "Vodja postopka"]);
      }

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

      const updatedWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
      workbook.Sheets[sheetName] = updatedWorksheet;

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "Zbirka_struktura.xlsx"; // Always save with a fixed name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    reader.readAsArrayBuffer(file);
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
