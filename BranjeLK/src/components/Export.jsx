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
          setError(null);
        } catch (err) {
          console.error("Napaka pri branju Excel datoteke:", err);
          setError("Napaka pri branju datoteke. Preverite, če je to veljavna Excel datoteka.");
          setWorkbook(null);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };
  
  const resetExport = () => {
    setFile(null);
    setFileName("");
    setWorkbook(null);
    setError(null);
    setSuccessMessage("");
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
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
      
      if (jsonData.length === 0) {
        jsonData.push(["Zap. št", "Geodetska pisarna", "Številka", "K.O", "Št. elaborata", "Št. tehničnega postopka", "P.I", "Dopolniti do", "Vodja postopka", "Ugotovitev uprave", "Komentar"]);
      }
      const requiredColumns = ["Zap. št", "Geodetska pisarna", "Številka", "K.O", "Št. elaborata", "Št. tehničnega postopka", "P.I", "Dopolniti do", "Vodja postopka", "Ugotovitev uprave", "Komentar"];
      
      if (jsonData[0].length < requiredColumns.length) {
        for (let i = jsonData[0].length; i < requiredColumns.length; i++) {
          jsonData[0].push(requiredColumns[i]);
        }
      }
      
      const existingEntriesMap = new Map();
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        while (row.length < requiredColumns.length) {
          row.push("");
        }
        
        const key = `${row[1] || ""}_${row[2] || ""}_${row[3] || ""}_${row[4] || ""}_${row[5] || ""}`;
        
        existingEntriesMap.set(key, {
          index: i,
          sequentialNumber: row[0] || "",
          comment: row[10] || "" 
        });
      }
      let lastSequentialNumber = 0;
      if (jsonData.length > 1) {
        lastSequentialNumber = Math.max(
          ...jsonData.slice(1).map(row => {
            const num = parseInt(row[0], 10);
            return isNaN(num) ? 0 : num;
          })
        );
      }
      
      const updatedRows = new Set();
      
      // Process each form
      for (let i = 0; i < formData.length; i++) {
        const form = formData[i];
        if (!form) continue;
      
        const geoPisarna = form.geoPisarna || "";
        const stevilka = form.stevilka || "";
        const ko = form.ko ? form.ko.split(",").join(", ") : "";
        const stevilkaElaborata = form.stevilkaElaborata || "";
        const stTehPos = form.stTehPos || "";
        
        const key = `${geoPisarna}_${stevilka}_${ko}_${stevilkaElaborata}_${stTehPos}`;
        
        if (existingEntriesMap.has(key)) {
          const existingEntry = existingEntriesMap.get(key);
          const existingComment = existingEntry.comment;
          const rowIndex = existingEntry.index;
          
          jsonData[rowIndex] = [
            existingEntry.sequentialNumber,
            geoPisarna,
            stevilka,
            ko,
            stevilkaElaborata,
            stTehPos,
            form.pi || "",
            form.dopolnitiDo || "",
            form.vodjaPostopka || "",
            form.ugotovitevUprave || "",
            existingComment 
          ];
          
          updatedRows.add(rowIndex);
        } else {
          lastSequentialNumber++;
          const newRow = [
            lastSequentialNumber,
            geoPisarna,
            stevilka,
            ko,
            stevilkaElaborata,
            stTehPos,
            form.pi || "",
            form.dopolnitiDo || "",
            form.vodjaPostopka || "",
            form.ugotovitevUprave || "",
            "" 
          ];
          jsonData.push(newRow);
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
        <div className="button-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            className="export-button"
            onClick={exportToExcel}
            disabled={!file || !workbook || isExporting || formData.filter(form => form !== undefined).length === 0}
          >
            {isExporting ? "Izvažanje..." : "Izvozi podatke"}
          </button>
          <button 
            className="reset-button" 
            onClick={resetExport}
            style={{ 
              backgroundColor: '#f44336', 
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Ponastavi izvoz
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green', backgroundColor: 'white', padding: '5px', borderRadius: '3px', marginTop: '10px' }}>{successMessage}</div>}
      </div>
    </div>
  );
}

export default Export;