import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";
import "./components.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function DragAndDrop() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    extractTextFromPDF(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [] },
    multiple: false,
  });

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument(typedArray).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }

        setExtractedText(text || "ni bilo najdenega nobenga texta.");
      } catch (error) {
        console.error("prislo je do napake:", error);
        setExtractedText("Failed to extract text from this PDF.");
      }
    };console.log(extractedText)
  };

  return (
    <div className="dragAndDrop">
      <div {...getRootProps()} className="dragNDropPolje">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Spustite datoteko tukaj...</p>
        ) : (
          <p>Povlecite in spustite datoteko tukaj ali kliknite spodnji gumb</p>
        )}
        <button>Izberite datoteko</button>
        {selectedFile && (
          <div className="selectedFiles">
            <p>Izbrana datoteka: {selectedFile.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DragAndDrop;
