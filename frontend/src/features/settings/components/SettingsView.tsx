import React, { useState, useMemo } from "react";
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

  const currencySymbol = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      const locale = navigator.language.toLowerCase();
      if (locale.includes('pt-br')) return 'R$';
      if (locale.includes('pt')) return '€';
    }
    return '$';
  }, []);

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
            
            <div className="w-full h-px bg-border my-4" />
            
            <div className="w-full text-left">
              <label htmlFor="budget" className="block text-sm font-medium text-foreground mb-1">
                Monthly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                <input
                  id="budget"
                  type="number"
                  className={cn(
                    "w-full pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    currencySymbol.length > 1 ? "pl-9" : "pl-7"
                  )}
                  placeholder="e.g. 5000"
                  defaultValue={user?.monthly_budget || ""}
                  onBlur={async (e) => {
                    const val = e.target.value;
                    const numVal = val ? parseFloat(val) : null;
                    if (numVal !== user?.monthly_budget) {
                      try {
                        setUpdating(true);
                        const updatedUser = await authApi.updateProfile({ monthly_budget: numVal });
                        setUser({ ...user, ...updatedUser });
                      } catch (error) {
                        console.error("Failed to update budget:", error);
                      } finally {
                        setUpdating(false);
                      }
                    }
                  }}
                  disabled={updating}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Set your target budget for the month.</p>
            </div>

            <div className="w-full h-px bg-border my-4" />
            
            <p className="text-xs text-muted-foreground/60 mt-2 font-mono break-all">
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
