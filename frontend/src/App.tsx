import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { AppLayout } from './components/layout/AppLayout';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { BoardPage } from './pages/BoardPage';
import { TeamsPage } from './pages/TeamsPage';
import { EpicsPage } from './pages/EpicsPage';
import { TicketPage } from './pages/TicketPage';

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<BoardPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/epics" element={<EpicsPage />} />
          <Route path="/tickets/new" element={<TicketPage />} />
          <Route path="/tickets/:id" element={<TicketPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
