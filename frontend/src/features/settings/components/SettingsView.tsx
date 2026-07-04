import React from "react";
import { useGlobalStore } from "../../../store/globalStore";
import { User } from "lucide-react";

export const SettingsView: React.FC = () => {
  const { user } = useGlobalStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="flex justify-center">
        {/* Profile Card */}
        <div className="w-full max-w-lg">
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold mb-4 shadow-md">
              {user?.name ? user.name[0].toUpperCase() : <User className="w-12 h-12" />}
            </div>
            
            <h2 className="text-xl font-bold text-foreground">
              {user?.name || "User Profile"}
            </h2>
            
            <p className="text-muted-foreground text-sm mt-1 mb-6">
              {user?.email || "No Email"}
            </p>
            
            <div className="w-full h-px bg-border my-2" />
            
            <p className="text-xs text-muted-foreground/60 mt-4 font-mono break-all">
              ID: {user?.user_id || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
