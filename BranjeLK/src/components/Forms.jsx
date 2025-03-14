import { useEffect, useState } from "react";
import { usePdf } from "./PdfContext"; 
import PopUp from "./Popout";

function Forms() {
  const { extractedText, extractingData, pdfFiles, geoPisarna, stevilka, ko, stevilkaElaborata, stTehPos, pi, dopolnitiDo, vodjaPostopka, setGeoPisarna, setStevilka, setKo, setStevilkaElaborata, setStTehPos, setPi, setDopolnitiDo, setVodjaPostopka, setUgotovitevUprave } = usePdf(); 

  const [isPopUpVisible, setIsPopUpVisible] = useState(false); 
  const [popUpText, setPopUpText] = useState(""); 

  const [currentPdfIndex, setCurrentPdfIndex] = useState(0); 

  useEffect(() => {
    if (pdfFiles && pdfFiles.length > 0) {
      const interval = setInterval(() => {
        setCurrentPdfIndex((prevIndex) => (prevIndex + 1) % pdfFiles.length); 
      }, 5000); 

      return () => clearInterval(interval);
    }
  }, [pdfFiles]);

  useEffect(() => {
    if (extractedText && extractingData) {
      const geoPisarnaMatch = extractedText.match(/Geodetska\s*pisarna\s*([\p{L}\s-]+?)(?=\s{2,}|$)/u);
      if (geoPisarnaMatch) setGeoPisarna(geoPisarnaMatch[1].trim());

      const stevilkaMatch = extractedText.match(/Številka:\s*([\d\-\/]+)/);
      if (stevilkaMatch) setStevilka(stevilkaMatch[1]);

      const koMatch = extractedText.match(/Katastrska\s*občina:\s*(\d+\s*[A-Za-zÀ-ž\s-]+)(?=\s*Datum|$)/);
      if (koMatch) setKo(koMatch[1]);

      const elaboratMatch = extractedText.match(/elaborat\s*številka\s*(\d+)/i);
      if (elaboratMatch) setStevilkaElaborata(elaboratMatch[1]);

      const tehPosMatch = extractedText.match(/tehničnem\s*postopku\s*številka\s*(\d+)/i);
      if (tehPosMatch) setStTehPos(tehPosMatch[1]);
      
      const piMatch = extractedText.match(/pooblaščeni\s*geodet\s*([a-zA-ZÀ-ž\s,\.]+?\([\w\d]+\))/i);
      if (piMatch) setPi(piMatch[1]);

      const dopolnitiDoMatch = extractedText.match(/do\s*(\d{2}\.\d{2}\.\d{4})/);
      if (dopolnitiDoMatch) setDopolnitiDo(dopolnitiDoMatch[1]);

      const vodjaMatch = extractedText.match(/Postopek\s*vodi:\s*([a-zA-ZÀ-ž\s]+?)\s{2,}/i);
      if (vodjaMatch) setVodjaPostopka(vodjaMatch[1]);
      
      const ugotovitevUpraveMatch = extractedText.match(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:[\s\S]+?(?=\s*Odprava|$)/);

      if (ugotovitevUpraveMatch) {
        const cleanedUgotovitevUprave = ugotovitevUpraveMatch[0]
          .replace(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:\s*/, '')
          .replace(/,\s*$/, '');  
        
        setUgotovitevUprave(cleanedUgotovitevUprave);
      }
    }
  }, [extractedText, extractingData, currentPdfIndex]);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const togglePopUp = () => {
    setIsPopUpVisible(!isPopUpVisible);
    if (!isPopUpVisible) {
      setPopUpText(ugotovitevUprave || "No data found.");
    }
  };

  return (
    <div className="forms">
      <div className="forms-box">
        <label>Obdelava PDF:</label>
        <input 
          type="text" 
          value={pdfFiles && pdfFiles.length > 0 ? pdfFiles[currentPdfIndex].name : ""} 
          placeholder="Obdelan PDF" 
          readOnly
        />
        <label>Geodetska pisarna:</label>
        <input 
          type="text" 
          value={geoPisarna} 
          placeholder="Geodetska pisarna" 
          onChange={handleInputChange(setGeoPisarna)} 
        />
      </div>
      <div className="forms-box">
        <label>Številka:</label>
        <input 
          type="text" 
          value={stevilka} 
          placeholder="Številka" 
          onChange={handleInputChange(setStevilka)} 
        />
        <label>K.O:</label>
        <input 
          type="text" 
          value={ko} 
          placeholder="K.O" 
          onChange={handleInputChange(setKo)} 
        />
      </div>
      <div className="forms-box">
        <label>Številka elaborata:</label>
        <input 
          type="text" 
          value={stevilkaElaborata} 
          placeholder="Elaborat" 
          onChange={handleInputChange(setStevilkaElaborata)} 
        />
        <label>Št. tehničnega postopka:</label>
        <input 
          type="text" 
          value={stTehPos} 
          placeholder="Tehnični postopek" 
          onChange={handleInputChange(setStTehPos)} 
        />
      </div>
      <div className="forms-box">
        <label>Pooblaščeni geodet:</label>
        <input 
          type="text" 
          value={pi} 
          placeholder="Pooblaščeni geodet" 
          onChange={handleInputChange(setPi)} 
        />
        <label>Dopolniti do:</label>
        <input 
          type="text" 
          value={dopolnitiDo} 
          placeholder="Dopolniti do" 
          onChange={handleInputChange(setDopolnitiDo)} 
        />
      </div>
      <div className="forms-box">
        <label>Vodja postopka:</label>
        <input 
          type="text" 
          value={vodjaPostopka} 
          placeholder="Vodja postopka" 
          onChange={handleInputChange(setVodjaPostopka)} 
        />
        <label>Ugotovitev uprave:</label>
        <button onClick={togglePopUp}>Prikaži ugotovitve</button>
      </div>

      {isPopUpVisible && <PopUp text={popUpText} onClose={togglePopUp} />}
    </div>
  );
}

export default Forms;
