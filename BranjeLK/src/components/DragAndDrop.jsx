import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";
import "./components.css";
import { usePdf } from "./PdfContext";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function DragAndDrop() {
  const { setExtractedText } = usePdf();
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFileName(file.name); 
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
        console.log(text);

        setExtractedText(text || "Ni bilo najdenega nobenega teksta.");
      } catch (error) {
        console.error("Prišlo je do napake:", error);
        setExtractedText("Napaka pri branju PDF.");
      }
    };
  };

  return (
    <div className="dragAndDrop">
      <div {...getRootProps()} className="dragNDropPolje">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Spustite datoteko tukaj...</p>
        ) : (
          <p>Povlecite in spustite datoteko tukaj ali kliknite spodnji gumb.</p>
        )}
        <button>Izberite datoteko</button>
        {fileName && <p>Izbrana datoteka: {fileName}</p>}
      </div>
    </div>
  );
}

export default DragAndDrop;
