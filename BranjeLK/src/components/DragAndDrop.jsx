import { useState } from "react";
import { usePdf } from "./PdfContext";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function DragAndDrop({ setNumForms }) {
  const { setPdfFiles, setExtractedTexts, setExtractingData } = usePdf();
  const [fileNames, setFileNames] = useState([]);
  const [processing, setProcessing] = useState(false);

  const hardCodedFolderPath = "C:/Users/valer/OneDrive - Univerza v Mariboru/Namizje/GZ-Celje/BranjeLK/PDF-bralnik/BranjeLK/pdf-doc";

  const handleSelectHardCodedFolder = async () => {
    const fs = window.require("fs");
    const path = window.require("path");

    try {
      const files = fs.readdirSync(hardCodedFolderPath);
      const pdfFiles = files.filter(file => path.extname(file) === ".pdf");

      setFileNames(pdfFiles);
      setPdfFiles(pdfFiles.map(file => ({ path: path.join(hardCodedFolderPath, file), name: file })));
      setNumForms(pdfFiles.length);
    } catch (error) {
      console.error("prislo je do napake pri dostopanju datoteke:", error);
    }
  };

  const extractTextFromPDF = async (filePath) => {
    const fs = window.require("fs");

    try {
      const pdfData = fs.readFileSync(filePath);
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      console.log(`Extracted text from ${filePath}:\n${text}`);
      return { filePath, text: text || "No text found in the PDF." };
    } catch (error) {
      console.error("Error reading the PDF file:", error);
      return { filePath, text: `Error processing ${filePath}: Error reading the PDF file.` };
    }
  };

  const handleProcessData = async () => {
    setProcessing(true);
    setExtractingData(true);
    console.log("Successfully processing data for:", fileNames);

    let extractedTexts = [];

    for (const fileName of fileNames) {
      const filePath = `${hardCodedFolderPath}/${fileName}`;
      const extractedData = await extractTextFromPDF(filePath);
      extractedTexts.push(extractedData); 
    }

    setExtractedTexts(extractedTexts); 
    setProcessing(false);
  };

  const removeFiles = () => {
    setFileNames([]);
    setExtractedTexts([]); 
    setExtractingData(false);
    setProcessing(false);
  };

  return (
    <div className="dragAndDrop">
      <div className="select-folder-button">
        <button className="select-folder" onClick={handleSelectHardCodedFolder}>Izberi mapo</button>
        {fileNames.length > 0 &&
          fileNames.map((name, index) => (
            <p key={index}>Izbrane datoteke: {name}</p>
          ))}
      </div>
      <div className="drag-and-drop-buttons">
        <button onClick={handleProcessData} className="process-data-button" disabled={processing}>
          {processing ? "Processing..." : "Process Data"}
        </button>
        <button onClick={removeFiles} className="remove-file-button">
          Izbriši datoteke
        </button>
      </div>
    </div>
  );
}

export default DragAndDrop;
