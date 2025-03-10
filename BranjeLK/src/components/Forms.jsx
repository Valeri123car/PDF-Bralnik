import { useEffect, useState } from "react";
import { usePdf } from "./PdfContext"; 
import PopUp from "./Popout";

function Forms() {
  const { extractedText } = usePdf();

  const [geoPisarna, setGeoPisarna] = useState("");
  const [stevilka, setStevilka] = useState("");
  const [ko, setKo] = useState("");
  const [stevilkaElaborata, setStevilkaElaborata] = useState("");
  const [stTehPos, setStTehPos] = useState("");
  const [pi, setPi] = useState("");
  const [dopolnitiDo, setDopolnitiDo] = useState("");
  const [vodjaPostopka, setVodjaPostopka] = useState("");
  const [ugotovitevUprave, setUgotovitevUprave] = useState("");
  const [isPopUpVisible, setIsPopUpVisible] = useState(false); 


  useEffect(() => {
    if (extractedText) {
      const geoPisarnaMatch = extractedText.match(/Geodetska\s*pisarna\s*([\p{L}\s-]+?)(?=\s{2,}|$)/u);
      if (geoPisarnaMatch) setGeoPisarna(geoPisarnaMatch[1].trim());

      if (geoPisarnaMatch) setGeoPisarna(geoPisarnaMatch[1]);

      const stevilkaMatch = extractedText.match(/Številka:\s*([\d\-\/]+)/);
      if (stevilkaMatch) setStevilka(stevilkaMatch[1]);

      const koMatch = extractedText.match(/Katastrska\s*občina:\s*(\d+\s*[A-Za-zÀ-ž\s-]+)(?=\s*Datum|$)/);
      if (koMatch) setKo(koMatch[1]);

      const elaboratMatch = extractedText.match(/elaborat\s*številka\s*(\d+)/i);
      if (elaboratMatch) setStevilkaElaborata(elaboratMatch[1]);

      const tehPosMatch = extractedText.match(/tehničnem\s*postopku\s*številka\s*(\d+)/i);
      if (tehPosMatch) setStTehPos(tehPosMatch[1]);
      
      const piMatch = extractedText.match(/pooblaščeni\s*geodet\s*([a-zA-ZÀ-ž\s,\.]+?\([\w\d]+\))/i);
      console.log(extractedText.match(/pooblaščeni\s*geodet\s*([a-zA-ZÀ-ž\s,\.]+?\([\w\d]+\))/i));
      if (piMatch) setPi(piMatch[1]);
      

      const dopolnitiDoMatch = extractedText.match(/do\s*(\d{2}\.\d{2}\.\d{4})/); //TULE ŠE MOREM DODAT ČE NI DATUM AMPAK SAMO BESEDA 10 DNI
      if (dopolnitiDoMatch) setDopolnitiDo(dopolnitiDoMatch[1]);

      const vodjaMatch = extractedText.match(/Postopek\s*vodi:\s*([a-zA-ZÀ-ž\s]+?)\s{2,}/i);
      if (vodjaMatch) setVodjaPostopka(vodjaMatch[1]);
      
      const ugotovitevUprave = extractedText.match(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:[\s\S]+?(?=\s*Odprava|$)/);

      if (ugotovitevUprave) {
        const cleanedUgotovitevUprave = ugotovitevUprave[0]
          .replace(/Geodetska\s*uprava\s*je\s*pri\s*preizkusu\s*elaborata\s*ugotovila:\s*/, '')
          .replace(/,\s*$/, '');  
        
        setUgotovitevUprave(cleanedUgotovitevUprave);
      }

    }
  }, [extractedText]);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const togglePopUp = () => {
    setIsPopUpVisible(!isPopUpVisible);
};

  return (
    <div className="forms">
      <div className="forms-box">
        <label>Geodetska pisarna:</label>
        <input 
          type="text" 
          value={geoPisarna} 
          placeholder="Geodetska pisarna" 
          onChange={handleInputChange(setGeoPisarna)} 
        />
        <label>Številka:</label>
        <input 
          type="text" 
          value={stevilka} 
          placeholder="Številka" 
          onChange={handleInputChange(setStevilka)} 
        />
      </div>
      <div className="forms-box">
        <label>K.O:</label>
        <input 
          type="text" 
          value={ko} 
          placeholder="K.O" 
          onChange={handleInputChange(setKo)} 
        />
        <label>Številka elaborata:</label>
        <input 
          type="text" 
          value={stevilkaElaborata} 
          placeholder="Številka elaborata" 
          onChange={handleInputChange(setStevilkaElaborata)} 
        />
      </div>
      <div className="forms-box">
        <label>Št. tehničnega postopka:</label>
        <input 
          type="text" 
          value={stTehPos} 
          placeholder="Št. tehničnega postopka" 
          onChange={handleInputChange(setStTehPos)} 
        />
        <label>P.I.:</label>
        <input 
          type="text" 
          value={pi} 
          placeholder="P.I." 
          onChange={handleInputChange(setPi)} 
        />
      </div>
      <div className="forms-box">
        <label>Dopolniti do:</label>
        <input 
          type="text" 
          value={dopolnitiDo} 
          placeholder="Dopolniti do" 
          onChange={handleInputChange(setDopolnitiDo)} 
        />
        <label>Vodja postopka:</label>
        <input 
          type="text" 
          value={vodjaPostopka} 
          placeholder="Vodja postopka" 
          onChange={handleInputChange(setVodjaPostopka)} 
        />
      </div>
      <div className="forms-box">
        <label>Ugotovitev uprave:</label>
        <button className="popUpButton" onClick={togglePopUp}>Preglej ugotovitve</button>
        {isPopUpVisible && <PopUp text={ugotovitevUprave} onClose={togglePopUp} />}
      </div>
    </div>
  );
}

export default Forms;
