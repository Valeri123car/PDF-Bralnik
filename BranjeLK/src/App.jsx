import { useState } from 'react'
import DragAndDrop from './components/DragAndDrop'
import './App.css'
import Forms from './components/Forms'
import Export from './components/Export'
import Header from './components/Header'
import { PdfProvider } from "./components/PdfContext"; 


function App() {

  return (
    <>
      <Header></Header>
      <PdfProvider>
        <DragAndDrop></DragAndDrop>
        <Forms></Forms>
      </PdfProvider>
      <Export></Export>
    </>
  )
}

export default App
