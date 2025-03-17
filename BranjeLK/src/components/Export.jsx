import { usePdf } from './PdfContext';
import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';

function Export() {
  const { geoPisarna, stevilka, ko, stevilkaElaborata, stTehPos, pi, dopolnitiDo, vodjaPostopka } = usePdf();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const isElectron = () => {
    console.log("Checking if electron is available:", !!window.electron);
    return window.electron !== undefined;
  };

  // Set up listener for file saved events
  useEffect(() => {
    if (isElectron()) {
      // Function to handle file saved event
      const handleFileSaved = (event, result) => {
        if (result.success) {
          setSuccessMessage("Podatki so bili uspešno shranjeni v obstoječo datoteko.");
        } else {
          setError(`Napaka pri shranjevanju: ${result.error}`);
        }
      };

      // Add the listener
      if (window.electron && window.electron.onFileSaved) {
        window.electron.onFileSaved(handleFileSaved);
      }

      // Clean up function not needed since onFileSaved doesn't return a cleanup method
    }
  }, []);

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

  const handleDeleteFile = () => {
    setFile(null);
    setFileName("");
    setWorkbook(null);
    setError(null);
    setSuccessMessage("");
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

      if (isElectron()) {
        try {
          // Send the file data to be saved using the API defined in preload.js
          const fileData = {
            buffer: Array.from(excelBuffer),  // Convert to regular array for IPC
            name: fileName,
            originalPath: file.path
          };
          
          window.electron.saveFile(fileData);
          // The response will be handled by the useEffect listener
        } catch (err) {
          console.error("Napaka pri shranjevanju v Electron:", err);
          setError(`Napaka pri shranjevanju: ${err.message}`);
        }
      } else {
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName || "exported-data.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccessMessage("Nova datoteka je pripravljena za prenos. Prosimo, shranite jo in ročno zamenjajte obstoječo datoteko.");
      }
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
        {file && <button onClick={handleDeleteFile}>X</button>}
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          disabled={isExporting}
        />
        <button
          onClick={exportToExcel}
          disabled={!file || !workbook || isExporting}
        >
          {isExporting ? "Izvažanje..." : "Izvozi podatke"}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green', marginTop: '10px' }}>{successMessage}</div>}
        {!isElectron() && <div style={{ color: 'blue', marginTop: '10px', fontSize: '0.9em' }}>
          Opomba: Uporabljate brskalnik. Datoteka bo shranjena v privzeto mapo za prenose.
        </div>}
      </div>
    </div>
  );
}

export default Export;