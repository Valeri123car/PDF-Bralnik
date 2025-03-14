import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";
import { usePdf } from "./PdfContext";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function DragAndDrop({ setNumForms }) {
  const { setPdfFiles, setExtractedText, setExtractingData } = usePdf();
  const [fileNames, setFileNames] = useState([]);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles;
    setFileNames((prevFileNames) => [
      ...prevFileNames,
      ...files.map((file) => file.name),
    ]);
    
    setPdfFiles(files);

    setNumForms(files.length);

    files.forEach((file) => extractTextFromPDF(file));
  }, [setPdfFiles, setNumForms]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [] },
    multiple: true,
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

        setExtractedText(text || "ni blo najdenega teksta");
      } catch (error) {
        console.error("prišlo je do napake:", error);
        setExtractedText("napaka pri branju pdf datoteke");
      }
    };
  };

  const handleProcessData = () => {
    setProcessing(true);
    setExtractingData(true);
    console.log("uspešno obdelani podatki za:", fileNames);
    console.log(fileNames.length);
  };

  const odstraniDatoteke = () => {
    setFileNames([]);
    setExtractedText();
    setExtractingData();
    setProcessing();
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
        {fileNames.length > 0 &&
          fileNames.map((name, index) => (
            <p key={index}>Izbrana datoteka: {name}</p>
          ))}
      </div>
      <div className="drag-and-drop-buttons">
        <button onClick={handleProcessData} className="obdelaj-podatke-button">
          Obdelaj podatke
        </button>
        <button onClick={odstraniDatoteke} className="odstrani-datoteko-button">
          Odstrani datoteko
        </button>
      </div>
    </div>
  );
}

export default DragAndDrop;
