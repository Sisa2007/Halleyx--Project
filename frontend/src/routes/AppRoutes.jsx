import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import Dashboard from '../pages/Dashboard';
import DashboardBuilder from '../pages/DashboardBuilder';
import CustomerOrders from '../pages/CustomerOrders';
import WorkflowList from '../pages/WorkflowList';
import WorkflowEditor from '../pages/WorkflowEditor';
import StepEditor from '../pages/StepEditor';
import RuleEditor from '../pages/RuleEditor';
import ExecutionPage from '../pages/ExecutionPage';
import LogsPage from '../pages/LogsPage';

export default function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                        element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"               element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/dash-builder"            element={<AnimatedPage><DashboardBuilder /></AnimatedPage>} />
        <Route path="/orders"                  element={<AnimatedPage><CustomerOrders /></AnimatedPage>} />
        <Route path="/workflows"               element={<AnimatedPage><WorkflowList /></AnimatedPage>} />
        <Route path="/workflows/create"        element={<AnimatedPage><WorkflowEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/edit"      element={<AnimatedPage><WorkflowEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/steps"     element={<AnimatedPage><StepEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/rules"     element={<AnimatedPage><RuleEditor /></AnimatedPage>} />
        <Route path="/workflows/:id/execute"   element={<AnimatedPage><ExecutionPage /></AnimatedPage>} />
        <Route path="/logs"                    element={<AnimatedPage><LogsPage /></AnimatedPage>} />
        <Route path="*"                        element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
