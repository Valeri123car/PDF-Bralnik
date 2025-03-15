import { useEffect, useState } from "react";
import { usePdf } from "./PdfContext";
import PopUp from "./Popout";

function Forms({ index = 0 }) {
  const pdfContext = usePdf();
  const { extractedTexts, extractingData, pdfFiles } = usePdf();
  
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [popUpText, setPopUpText] = useState("");
  
  // Local state for this specific form
  const [geoPisarna, setGeoPisarna] = useState('');
  const [stevilka, setStevilka] = useState('');
  const [ko, setKo] = useState('');
  const [stevilkaElaborata, setStevilkaElaborata] = useState('');
  const [stTehPos, setStTehPos] = useState('');
  const [pi, setPi] = useState('');
  const [dopolnitiDo, setDopolnitiDo] = useState('');
  const [vodjaPostopka, setVodjaPostopka] = useState('');
  const [ugotovitevUprave, setUgotovitevUprave] = useState('');

  useEffect(() => {
    // Only process if we have extracted texts and this form's index exists in the array
    if (extractedTexts && extractedTexts.length > index && extractingData) {
      const currentPdfText = extractedTexts[index].text;
      
      // Combined regex for geodetska pisarna
      const geoPisarnaMatch = 
        currentPdfText.match(/Geodetska\s*pisarna\s*([\p{L}\s-]+?)(?=\s{2,}|$)/u) || 
        currentPdfText.match(/Območna\s*geodetska\s*uprava\s*([A-Za-zÀ-ž\s]+?)(?=\s{2,}|$|\s+T:)/u);
      
      if (geoPisarnaMatch) setGeoPisarna(geoPisarnaMatch[1].trim());
  
      const stevilkaMatch = currentPdfText.match(/Številka:\s*([\d\-\/]+)/);
      if (stevilkaMatch) setStevilka(stevilkaMatch[1]);
  
      const koMatch = currentPdfText.match(/Katastrska\s*občina:\s*(\d+\s*[A-Za-zÀ-ž\s-]+)(?=\s*Datum|$)/);
      if (koMatch) setKo(koMatch[1]);
  
      const elaboratMatch = currentPdfText.match(/elaborat\s*številka\s*(\d+)/i);
      if (elaboratMatch) setStevilkaElaborata(elaboratMatch[1]);
  
      const tehPosMatch = currentPdfText.match(/tehničnem\s*postopku\s*številka\s*(\d+)/i);
      if (tehPosMatch) setStTehPos(tehPosMatch[1]);
  
      const piMatch = currentPdfText.match(/pooblaščeni\s*geodet\s*([a-zA-ZÀ-ž\s,\.]+?\([\w\d]+\))/i);
      if (piMatch) setPi(piMatch[1]);
  
      // Combined regex for dopolniti do
      const documentDateMatch = currentPdfText.match(/Datum:\s*(\d{2}\.\d{2}\.\d{4})/);
      let baseDate = new Date(); // Default to current date if document date not found

      if (documentDateMatch) {
      // Parse document date (DD.MM.YYYY format)
        const [day, month, year] = documentDateMatch[1].split('.').map(part => parseInt(part, 10));
        baseDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript
      }

// Combined regex for dopolniti do
const dopolnitiDoMatch = 
  currentPdfText.match(/do\s*(\d{2}\.\d{2}\.\d{4})/) || 
  currentPdfText.match(/najkasneje\s*v\s*(\d+)ih\s*dneh\s*od\s*prejema/i);

if (dopolnitiDoMatch) {
  if (dopolnitiDoMatch[1] && dopolnitiDoMatch[1].includes('.')) {
    // If it's already in date format, use it directly
    setDopolnitiDo(dopolnitiDoMatch[1]);
  } else if (dopolnitiDoMatch[1]) {
    // If it's a number of days, calculate the date from the document date
    const days = parseInt(dopolnitiDoMatch[1], 10);
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + days);
    
    // Format as DD.MM.YYYY
    const formattedDate = `${String(targetDate.getDate()).padStart(2, '0')}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${targetDate.getFullYear()}`;
    setDopolnitiDo(formattedDate);
  }
}
  
      const vodjaMatch = currentPdfText.match(/Postopek\s*vodi:\s*([a-zA-ZÀ-ž\s]+?)(?=\s+višja|\s+svetovalka|\s{2,}|$)/i);
      if (vodjaMatch) {
        setVodjaPostopka(vodjaMatch[1].trim());
      }
  
      // Combined regex for ugotovitev uprave
      const ugotovitevUpraveMatch = 
        currentPdfText.match(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:[\s\S]+?(?=\s*Odprava|$)/) || 
        currentPdfText.match(/Geodetska\s*uprava\s*(je\s*pri\s*preizkusu\s*elaborata\s*ugotovila|je.*?ugotovila):\s*(.*?)(?=Odprava\s*zgoraj|$)/is);
  
      if (ugotovitevUpraveMatch) {
        let cleanedUgotovitevUprave;
        
        if (ugotovitevUpraveMatch[2]) {
          // New pattern matched (has group 2)
          cleanedUgotovitevUprave = ugotovitevUpraveMatch[2].trim();
        } else {
          // Original pattern matched
          cleanedUgotovitevUprave = ugotovitevUpraveMatch[0]
            .replace(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:\s*/, '')
            .replace(/,\s*$/, '');
        }
        
        setUgotovitevUprave(cleanedUgotovitevUprave);
      }
    }
  }, [extractedTexts, extractingData, index]);
  
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
      <div className="forms-header">
        <h3>PDF Form {index + 1}</h3>
        <p>{pdfFiles && pdfFiles.length > index ? pdfFiles[index].name : "No file"}</p>
      </div>
      <div className="forms-box">
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