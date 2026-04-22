import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import PetProfile from './pages/PetProfile/PetProfile'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pet-profile" element={<PetProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
