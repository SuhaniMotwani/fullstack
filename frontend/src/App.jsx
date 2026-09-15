import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CrmApp from './apps/crm';
import ProjectsApp from './apps/projects';
import TasksApp from './apps/tasks';
import AccountsApp from './apps/accounts';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '1rem' }}>
          <strong>ArchScale</strong>
          <Link to="/crm">CRM</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/accounts">Accounts</Link>
        </nav>
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<div>Select an app from the navigation.</div>} />
            <Route path="/crm/*" element={<CrmApp />} />
            <Route path="/projects/*" element={<ProjectsApp />} />
            <Route path="/tasks/*" element={<TasksApp />} />
            <Route path="/accounts/*" element={<AccountsApp />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
