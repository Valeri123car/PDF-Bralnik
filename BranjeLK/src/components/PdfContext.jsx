import { createContext, useContext, useState } from 'react';

const PdfContext = createContext();

export const PdfProvider = ({ children }) => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [extractingData, setExtractingData] = useState(false);
  const [geoPisarna, setGeoPisarna] = useState('');
  const [stevilka, setStevilka] = useState('');
  const [ko, setKo] = useState('');
  const [stevilkaElaborata, setStevilkaElaborata] = useState('');
  const [stTehPos, setStTehPos] = useState('');
  const [pi, setPi] = useState('');
  const [dopolnitiDo, setDopolnitiDo] = useState('');
  const [vodjaPostopka, setVodjaPostopka] = useState('');
  const [ugotovitevUprave, setUgotovitevUprave] = useState('');

  return (
    <PdfContext.Provider value={{
      pdfFiles, setPdfFiles,
      extractedText, setExtractedText,
      extractingData, setExtractingData,
      geoPisarna, setGeoPisarna,
      stevilka, setStevilka,
      ko, setKo,
      stevilkaElaborata, setStevilkaElaborata,
      stTehPos, setStTehPos,
      pi, setPi,
      dopolnitiDo, setDopolnitiDo,
      vodjaPostopka, setVodjaPostopka,
      ugotovitevUprave, setUgotovitevUprave
    }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => useContext(PdfContext);
