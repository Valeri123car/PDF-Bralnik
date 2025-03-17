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

  const hardCodedFolderPath = "C:/Users/USER/Desktop/GZD-Celje/PDF-Bralnik/BranjeLK/pdf-doc";

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
      console.error("Error accessing the folder:", error);
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
      extractedTexts.push(extractedData); // Store each extracted data in array
    }

    setExtractedTexts(extractedTexts); // Set the extracted texts array in context
    setProcessing(false);
  };

  const removeFiles = () => {
    setFileNames([]);
    setExtractedTexts([]); // Reset extracted texts
    setExtractingData(false);
    setProcessing(false);
  };

  return (
    <div className="dragAndDrop">
      <div>
        <button onClick={handleSelectHardCodedFolder}>Select Folder (Hard-coded)</button>
        {fileNames.length > 0 &&
          fileNames.map((name, index) => (
            <p key={index}>Selected file: {name}</p>
          ))}
      </div>
      <div className="drag-and-drop-buttons">
        <button onClick={handleProcessData} className="process-data-button" disabled={processing}>
          {processing ? "Processing..." : "Process Data"}
        </button>
        <button onClick={removeFiles} className="remove-file-button">
          Remove File
        </button>
      </div>
    </div>
  );
}

export default DragAndDrop;
