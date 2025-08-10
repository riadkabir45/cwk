import './App.css'
import { Route, Routes } from 'react-router-dom'
import VarIntro from './pages/VarIntro'
import TestAuth from './components/auth/TestAuth'
import SignUp from './components/auth/SignUp'
import Login from './components/auth/Login'
import Home from './pages/Home'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

function App() {
  return (
    <Routes>
      {/* Main layout with sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/variables" element={<VarIntro />} />
        <Route path="/:namespace" element={<VarIntro />} />
      </Route>
      
      {/* Auth layout without sidebar */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/test" element={<TestAuth />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/login" element={<Login />} />
      </Route>
    </Routes>
  )
}

export default App