import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AuthGuard from './routes/AuthGuard';
import DashboardLayout from './layouts/DashboardLayout';
import ClientPortalLayout from './layouts/ClientPortalLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import PipelinePage from './pages/PipelinePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MyWorkPage from './pages/MyWorkPage';
import RequirementsPage from './pages/RequirementsPage';
import RequirementDetailsPage from './pages/RequirementDetailsPage';
import TicketsPage from './pages/TicketsPage';
import InvoicesPage from './pages/InvoicesPage';
import UsersPage from './pages/UsersPage';
import AuditLogPage from './pages/AuditLogPage';

import ClientDashboardPage from './pages/portal/ClientDashboardPage';
import ClientProjectsPage from './pages/portal/ClientProjectsPage';
import ClientProjectDetailsPage from './pages/portal/ClientProjectDetailsPage';
import ClientRequirementsPage from './pages/portal/ClientRequirementsPage';
import ClientTicketsPage from './pages/portal/ClientTicketsPage';

import { fetchCurrentUser } from './features/auth/authSlice';

function HomeRedirect() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Client') return <Navigate to="/portal/dashboard" replace />;
  return <Navigate to="/app/dashboard" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCurrentUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public / auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Internal app (employees) */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="crm/leads" element={<LeadsPage />} />
        <Route path="crm/leads/:id" element={<LeadDetailsPage />} />
        <Route path="crm/pipeline" element={<PipelinePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="my-work" element={<MyWorkPage />} />
        <Route path="requirements" element={<RequirementsPage />} />
        <Route path="requirements/:id" element={<RequirementDetailsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Client Portal (scoped, restricted) */}
      <Route
        path="/portal"
        element={
          <AuthGuard allowedRoles={['Client']}>
            <ClientPortalLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="projects" element={<ClientProjectsPage />} />
        <Route path="projects/:id" element={<ClientProjectDetailsPage />} />
        <Route path="requirements" element={<ClientRequirementsPage />} />
        <Route path="tickets" element={<ClientTicketsPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
