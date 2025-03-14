import { useState } from "react";
import { usePdf } from "./PdfContext";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";

const { ipcRenderer } = window.require("electron");

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function DragAndDrop({ setNumForms }) {
  const { setPdfFiles, setExtractedText, setExtractingData } = usePdf();
  const [fileNames, setFileNames] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Hard-coded path to folder containing PDFs
  const hardCodedFolderPath = "C:/Users/valer/OneDrive - Univerza v Mariboru/Namizje/pdf-doc"; // Set your folder path here

  // Function to load PDF files from a hard-coded folder
  const handleSelectHardCodedFolder = async () => {
    const fs = window.require("fs");
    const path = window.require("path");

    try {
      // Get list of files from the folder
      const files = fs.readdirSync(hardCodedFolderPath);
      const pdfFiles = files.filter(file => path.extname(file) === '.pdf'); // Filter out only PDF files

      setFileNames(pdfFiles);
      setPdfFiles(pdfFiles.map(file => ({ path: path.join(hardCodedFolderPath, file), name: file })));
      setNumForms(pdfFiles.length);
    } catch (error) {
      console.error("Error accessing the folder:", error);
    }
  };

  // Function to extract text from a PDF file
  const extractTextFromPDF = async (filePath) => {
    const fs = window.require("fs");

    try {
      const pdfData = fs.readFileSync(filePath); // Read the PDF file from disk
      const pdf = await pdfjs.getDocument(pdfData).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      // Save extracted text in the context state
      setExtractedText(text || "No text found in the PDF.");
    } catch (error) {
      console.error("Error reading the PDF file:", error);
      setExtractedText("Error reading the PDF file.");
    }
  };

  // Function to process the data (i.e., extract text from all PDFs)
  const handleProcessData = () => {
    setProcessing(true);
    setExtractingData(true);
    console.log("Successfully processing data for:", fileNames);

    // Extract text from all the PDFs
    fileNames.forEach((fileName) => {
      const filePath = `${hardCodedFolderPath}/${fileName}`;
      extractTextFromPDF(filePath); // Extract text from each PDF file
    });
  };

  // Function to clear the files
  const removeFiles = () => {
    setFileNames([]);
    setExtractedText("");
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
        <button onClick={handleProcessData} className="process-data-button">
          Process Data
        </button>
        <button onClick={removeFiles} className="remove-file-button">
          Remove File
        </button>
      </div>
    </div>
  );
}

export default DragAndDrop;
