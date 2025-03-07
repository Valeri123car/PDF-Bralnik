function Forms(){

    return (

        <div className="forms">
            <div className="forms-box">
                <div className="forms-box-inside">
                    <label>
                    Zap št:
                    </label>
                </div>
                <input type="text" name="name" placeholder="Zap št."/>
                <div className="forms-box-inside">
                    <label>
                    Geodetska pisarna
                    </label>
                </div>
                <input type="text" name="name" placeholder="Geodetska pisarna"/>
            </div>
            <div className="forms-box">
                <div className="forms-box-inside">
                    <label>
                    Številka:
                    </label>
                </div>
                <input type="text" name="name" placeholder="Številka"/>
                <div className="forms-box-inside">
                    <label>
                    K.O
                    </label>
                </div>
                <input type="text" name="name" placeholder="K.O"/>
            </div>
            <div className="forms-box">
                <div className="forms-box-inside">
                    <label>
                    Številka elaborata
                    </label>
                </div>
                <input type="text" name="name" placeholder="Številka elaborata"/>
                <div className="forms-box-inside">
                    <label>
                    Št. tehničnega postopka
                    </label>
                </div>
                <input type="text" name="name" placeholder="Št. tehničnega postopka"/>
            </div>
            <div className="forms-box">
                <div className="forms-box-inside">
                    <label>
                    P.I.
                    </label>
                </div>
                <input type="text" name="name" placeholder="P.I."/>
                <div className="forms-box-inside">
                    <label>
                    Dopolniti do
                    </label>
                </div>
                <input type="text" name="name" placeholder="Dopolniti do"/>
            </div>
            <div className="forms-box">
                <div className="forms-box-inside">
                    <label>
                    Vodja postopka:
                    </label>
                </div>
                <input type="text" name="name" placeholder="Vodja postopka"/>
            </div>
        </div>
    );

};

export default Forms;