import gzdc from "./gzdc.jpg"
import "./components.css"

function Header(){
    return(
        <div className="header">
        <img src={gzdc} alt='GZ-Celje'/>
        </div>
    );
}

export default Header;