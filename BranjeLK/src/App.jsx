import { useState } from 'react'
import DragAndDrop from './components/DragAndDrop'
import './App.css'
import Forms from './components/Forms'
import Export from './components/Export'
import Header from './components/Header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <DragAndDrop></DragAndDrop>
      <Forms></Forms>
      <Export></Export>
    </>
  )
}

export default App
