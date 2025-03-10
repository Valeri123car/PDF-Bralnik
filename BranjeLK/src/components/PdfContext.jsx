import { createContext, useState, useContext } from "react";

const PdfContext = createContext();

export const PdfProvider = ({ children }) => {
  const [extractedText, setExtractedText] = useState("");

  return (
    <PdfContext.Provider value={{ extractedText, setExtractedText }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => useContext(PdfContext);
