import './App.css'
import { Route, Routes } from 'react-router-dom'
import VarIntro from './pages/VarIntro'
import TestAuth from './components/auth/TestAuth'
import SignUp from './components/auth/SignUp'
import Login from './components/auth/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import Home from './pages/Home'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import CreateTask from './pages/CreateTask';
import TaskStatuses from './pages/TaskStatuses';
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Protected routes with main layout and sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/variables" element={
          <ProtectedRoute>
            <VarIntro />
          </ProtectedRoute>
        } />
        <Route path="/:namespace" element={
          <ProtectedRoute>
            <VarIntro />
          </ProtectedRoute>
        } />
        <Route path="/tasks/create" element={
          <ProtectedRoute>
            <CreateTask />
          </ProtectedRoute>
        } />
        <Route path="/tasks/statuses" element={
          <ProtectedRoute>
            <TaskStatuses />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Public auth layout without sidebar */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/test" element={<TestAuth />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  )
}

export default App