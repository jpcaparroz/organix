import React, { useState } from "react";
import { useGlobalStore } from "../../../store/globalStore";
import { User, Loader2 } from "lucide-react";
import { authApi } from "../../auth/api/auth";
import { cn } from "../../../lib/utils";

const AVATARS = [
  "default.png", "male-2.png", "male-3.png", "female-1.png"
];

export const SettingsView: React.FC = () => {
  const { user, setUser } = useGlobalStore();
  const [updating, setUpdating] = useState(false);

  const handleAvatarSelect = async (avatar: string) => {
    if (!user || updating) return;
    try {
      setUpdating(true);
      const updatedUser = await authApi.updateProfile({ icon: avatar });
      setUser({ ...user, ...updatedUser });
    } catch (error) {
      console.error("Failed to update avatar:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Card */}
        <div className="w-full lg:w-1/3">
          <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-sm relative">
            {updating && (
              <div className="absolute top-4 right-4 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            
            {user?.icon ? (
              <img 
                src={`/avatars/${user?.icon}`} 
                alt="Avatar" 
                className="size-24 rounded-full border-4 border-background shadow-md object-cover bg-muted mb-4" 
              />
            ) : (
              <div className="size-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold mb-4 shadow-md">
                {user?.name ? user.name[0].toUpperCase() : <User className="size-12" />}
              </div>
            )}
            
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

        {/* Avatar Selection Card */}
        <div className="w-full lg:w-2/3">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Choose Avatar</h3>
            <div className="flex flex-wrap gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar)}
                  disabled={updating}
                  className={cn(
                    "relative size-16 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    user?.icon === avatar 
                      ? "border-primary scale-110 shadow-md" 
                      : "border-transparent hover:border-border"
                  )}
                >
                  <img src={`/avatars/${avatar}`} alt={avatar} className="w-full h-full object-cover bg-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
