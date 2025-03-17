import { usePdf } from './PdfContext';
import * as XLSX from 'xlsx';
import { useState } from 'react';

function Export() {
  const { formData, pdfFiles } = usePdf();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: "array" });
          setWorkbook(wb);
        } catch (err) {
          console.error("Napaka pri branju Excel datoteke:", err);
          setError("Napaka pri branju datoteke. Preverite, če je to veljavna Excel datoteka.");
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  const exportToExcel = async () => {
    if (!file || !workbook) {
      alert("Najprej naložite Excel datoteko.");
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessMessage("");

    try {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // If spreadsheet is empty or new, create header row
      if (jsonData.length === 0) {
        jsonData.push(["Zap. št", "Geodetska pisarna", "Številka", "K.O", "Št. elaborata", "Št. tehničnega postopka", "P.I", "Dopolniti do", "Vodja postopka", "Ugotovitev uprave"]);
      }

      // Get the last sequential number
      let lastSequentialNumber = jsonData.length > 1 ? jsonData.length : 0;

      // Add a row for each form in formData
      for (let i = 0; i < formData.length; i++) {
        const form = formData[i];
        if (form) {  // Make sure we have data for this form
          const newRow = [
            lastSequentialNumber + 1,
            form.geoPisarna || "",
            form.stevilka || "",
            form.ko ? form.ko.split(",").join(", ") : "", // Handle multiple Katastrska občina values
            form.stevilkaElaborata || "",
            form.stTehPos || "",
            form.pi || "",
            form.dopolnitiDo || "",
            form.vodjaPostopka || "",
            form.ugotovitevUprave || ""
          ];
          
          jsonData.push(newRow);
          lastSequentialNumber++;
        }
      }

      const updatedWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
      workbook.Sheets[sheetName] = updatedWorksheet;

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "exported-data.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccessMessage("Podatki so bili uspešno izvoženi.");
      
    } catch (err) {
      console.error("Napaka pri izvozu:", err);
      setError(`Napaka pri izvozu: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export">
      <div className="export-polje">
        <div>Podatki bodo izvoženi v: {fileName || "Ni datoteke"}</div>
        <div>Število zaznanih obrazcev: {formData.filter(form => form !== undefined).length}</div>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          disabled={isExporting}
        />
        <button
          className="export-button"
          onClick={exportToExcel}
          disabled={!file || !workbook || isExporting || formData.length === 0}
        >
          {isExporting ? "Izvažanje..." : "Izvozi podatke"}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'white', marginTop: '10px' }}>{successMessage}</div>}
      </div>
    </div>
  );
}

export default Export;
