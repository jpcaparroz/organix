import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Organix</h1>
          <p className="text-muted-foreground mt-2">Personal Finance Manager</p>
        </div>
        <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
