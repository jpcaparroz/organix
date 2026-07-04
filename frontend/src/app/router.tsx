import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useGlobalStore } from "../store/globalStore";

// Layouts
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";

// Components / Pages
import { LoginForm } from "../features/auth/components/LoginForm";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { Dashboard } from "../features/dashboard/components/Dashboard";
import { ExpenseList } from "../features/expenses/components/ExpenseList";
import { IncomeList } from "../features/incomes/components/IncomeList";
import { CategoryManager } from "../features/settings/components/CategoryManager";
import { SettingsView } from "../features/settings/components/SettingsView";
import { PaymentMethodManager } from "../features/settings/components/PaymentMethodManager";

// ProtectedRoute Wrapper Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useGlobalStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Router Configuration
export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
    ],
  },
  // Private Main App Routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "expenses", element: <ExpenseList /> },
      { path: "incomes", element: <IncomeList /> },
      { path: "categories", element: <CategoryManager /> },
      { path: "payment-methods", element: <PaymentMethodManager /> },
      { path: "settings", element: <SettingsView /> },
      // Fallback
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
