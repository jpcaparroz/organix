import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalStore } from "../../store/globalStore";
import {
  Home,
  ArrowDownCircle,
  ArrowUpCircle,
  Tags,
  Settings,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  CreditCard
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export const AppNavbar: React.FC = () => {
  const location = useLocation();
  const { themeMode, toggleThemeMode, user, logout } = useGlobalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/", icon: <Home className="size-5" /> },
    { label: "Expenses", path: "/expenses", icon: <ArrowDownCircle className="size-5" /> },
    { label: "Incomes", path: "/incomes", icon: <ArrowUpCircle className="size-5" /> },
    { label: "Categories", path: "/categories", icon: <Tags className="size-5" /> },
    { label: "Payment", path: "/payment-methods", icon: <CreditCard className="size-5" /> },
    { label: "Settings", path: "/settings", icon: <Settings className="size-5" /> },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // Force full reload to clear state if needed, or use navigate if passed as prop
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            onClick={onClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200",
              isActive 
                ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 md:px-8">
      <header className="flex items-center justify-between p-3 md:px-6 md:py-3 bg-background/80 backdrop-blur-lg border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-lg">O</span>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight hidden md:block">Organix</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden md:flex flex-col items-end mr-2 px-2">
              <span className="text-sm font-semibold leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1 leading-none">{user.email}</span>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={toggleThemeMode} className="rounded-full">
            {themeMode === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive hidden md:flex">
            <LogOut className="size-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-full"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full md:hidden bg-background border border-border rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col p-2 space-y-1">
            <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            <div className="h-px bg-border my-2" />
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
