import { useState } from 'react';
import DragAndDrop from './components/DragAndDrop';
import './App.css';
import Forms from './components/Forms';
import Export from './components/Export';
import Header from './components/Header';
import { PdfProvider } from "./components/PdfContext";

function App() {
  const [numForms, setNumForms] = useState(1);

  const deleteForms =() => {
    setNumForms(0)
  }

  return (
    <>
      <Header />
      <PdfProvider>
        <DragAndDrop setNumForms={setNumForms} /> 
        {[...Array(numForms)].map((_, index) => (
          <Forms key={index} index={index} />
        ))}
        <div className="delete-all-forms"><button onClick={deleteForms}>Izbriši vse forme</button></div>
        <Export/>
      </PdfProvider>
    </>
  );
}

export default App;