// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import ProtectedRoute from './core/auth/ProtectedRoute';
import LoginPage from './core/auth/LoginPage';
import AppShell from './shell/AppShell';
import Dashboard from './shell/Dashboard';
import CrmApp from './apps/crm';
import ProjectsApp from './apps/projects';
import TasksApp from './apps/tasks';
import AccountsApp from './apps/accounts';
import ContactsApp from './apps/contacts';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Platform Overview Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Contacts Directory (Platform-Core, available to all orgs) */}
          <Route
            path="/contacts/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ContactsApp />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* CRM App (Guarded by 'crm' entitlement) */}
          <Route
            path="/crm/*"
            element={
              <ProtectedRoute requiredApp="crm">
                <AppShell>
                  <CrmApp />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Projects App (Guarded by 'projects' entitlement) */}
          <Route
            path="/projects/*"
            element={
              <ProtectedRoute requiredApp="projects">
                <AppShell>
                  <ProjectsApp />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Tasks App (Guarded by 'tasks' entitlement) */}
          <Route
            path="/tasks/*"
            element={
              <ProtectedRoute requiredApp="tasks">
                <AppShell>
                  <TasksApp />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Accounts App (Guarded by 'accounts' entitlement) */}
          <Route
            path="/accounts/*"
            element={
              <ProtectedRoute requiredApp="accounts">
                <AppShell>
                  <AccountsApp />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
