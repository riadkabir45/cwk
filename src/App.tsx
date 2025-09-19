import './App.css'
import { Route, Routes } from 'react-router-dom'
import VarIntro from './pages/VarIntro'
import TestAuth from './components/auth/TestAuth'
import SignUp from './components/auth/SignUp'
import Login from './components/auth/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import CreateTask from './pages/CreateTask';
import TaskStatuses from './pages/TaskStatus';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/admin/AdminPanel';
import TaskList from './pages/TaskList';
import ChatList from './pages/ChatList'
import ResumeChatList from './pages/ResumeChatList'
import ListConnections from './pages/ListConnections'
import ChatPage from './pages/Chating'
import NotificationPage from './pages/NotificationPage'
import LeaderBoard from './pages/LeaderBoard'
import UserRankings from './pages/UserRankings'
import UserProfile from './pages/UserProfile'
import MentorLeaderboard from './pages/MentorLeaderboard'

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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={['ADMIN', 'MODERATOR']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/variables" element={
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
        <Route path="/tasks/list" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="/chat/find" element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        } />
        <Route path="/chat/connections" element={
          <ProtectedRoute>
            <ListConnections />
          </ProtectedRoute>
        } />
        <Route path="/chat/list" element={
          <ProtectedRoute>
            <ResumeChatList />
          </ProtectedRoute>
        } />
        <Route path="/chat/:id" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        } />
        <Route path="/leaderBoard" element={
          <ProtectedRoute>
            <UserRankings />
          </ProtectedRoute>
        } />
        <Route path="/leaderBoard/:instanceId" element={
          <ProtectedRoute>
            <LeaderBoard />
          </ProtectedRoute>
        } />
        <Route path="/mentors/leaderboard" element={
          <ProtectedRoute>
            <MentorLeaderboard />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/:namespace" element={
          <ProtectedRoute>
            <VarIntro />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Public auth layout without sidebar /notifications */}
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