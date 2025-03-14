import { usePdf } from './PdfContext'; // Uvozimo usePdf

function PopUp({ onClose }) {
  const { ugotovitevUprave } = usePdf(); // Uporabimo usePdf za dostop do ugotovitevUprave

  return (
    <div className="popUpOkno">
      <div className="popUpTextPolje">
        <button className="popUpClose" onClick={onClose}>X</button>
        <div className="popUpText">
          <p>{ugotovitevUprave || "No data found."}</p> {/* Uporabimo ugotovitevUprave iz konteksta */}
        </div>
      </div>
    </div>
  );
}

export default PopUp;