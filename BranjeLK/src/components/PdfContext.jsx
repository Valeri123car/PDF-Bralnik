import React, { createContext, useState, useContext } from 'react';

const PdfContext = createContext();

export const PdfProvider = ({ children }) => {
  const [extractedText, setExtractedText] = useState('');
  const [extractingData, setExtractingData] = useState(false);
  const [pdfData, setPdfData] = useState([])

  return (
    <PdfContext.Provider value={{ extractedText, setExtractedText, extractingData, setExtractingData,pdfData, setPdfData }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => useContext(PdfContext);
