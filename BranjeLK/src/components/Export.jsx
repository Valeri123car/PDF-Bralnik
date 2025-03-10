import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function Export(){

    const [file, setFile] = useState(null); 
    const [fileName, setFileName] = useState(""); 

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile){
            setFile(uploadedFile)
            setFileName(uploadedFile.name)
        }
    }

    const handleDeleteFile = () => {
        setFile(null);
        setFileName("")
    }

    const exportToExcel = () => {
        if(!file){
            alert("Ni izbrane datoteke");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, {type:"binary"});
        }

        const sheet = workbook.Sheets[woorkbook.SheetNames[0]];

    }

    return (
        <div className="export">
            <div className="export-polje">
                <div>Podatki bodo izvoženi v:</div>
                <div>{/*sem gre ime datoteke*/}<button>X</button></div>
                <div><button>Naloži datoteko</button></div>
                <div><button>Izvozi podatke</button></div>
            </div>
        </div>
    );

};

export default Export;