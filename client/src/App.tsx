import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReposPage from './pages/ReposPage';
import AddRepoPage from './pages/AddRepoPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import QueryPage from './pages/QueryPage';
import CodeExplorerPage from './pages/CodeExplorerPage';
import ArchitecturePage from './pages/ArchitecturePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="repos" element={<ReposPage />} />
              <Route path="repos/new" element={<AddRepoPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:id" element={<ChatPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route
              path="/repos/:id/query"
              element={
                <ProtectedRoute>
                  <QueryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repos/:id/explore"
              element={
                <ProtectedRoute>
                  <CodeExplorerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repos/:id/architecture"
              element={
                <ProtectedRoute>
                  <ArchitecturePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
