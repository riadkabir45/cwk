import './App.css'
import { Route, Routes } from 'react-router-dom'
import VarIntro from './pages/VarIntro'
import TestAuth from './components/auth/TestAuth'
import SignUp from './components/auth/SignUp'
import Login from './components/auth/Login'
import Navbar from './components/Navbar'
import Home from './components/Home'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/variables" element={<VarIntro />} />
        <Route path="/:namespace" element={<VarIntro />} />
        <Route path="/auth/test" element={<TestAuth />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App