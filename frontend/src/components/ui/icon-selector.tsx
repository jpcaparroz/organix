import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "../../lib/utils/ui";
import {
  Home,
  ShoppingCart,
  Car,
  Utensils,
  Coffee,
  Wallet,
  DollarSign,
  Briefcase,
  Activity,
  HeartPulse,
  Monitor,
  Smartphone,
  Music,
  Video,
  Book,
  Plane,
  Train,
  Gift,
  Smile,
  Zap,
  Tag,
  CreditCard,
  Building,
  Wrench,
  Droplet,
  Flame,
  Wifi,
  ShoppingBag,
  Ticket,
  GraduationCap,
  Baby,
  Dog,
  Gamepad,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Landmark,
  CircleHelp,
} from "lucide-react";

export type IconName = string;

// Map of available icons for the selector
export const AVAILABLE_ICONS: Record<string, React.ElementType> = {
  Home,
  ShoppingCart,
  ShoppingBag,
  Car,
  Utensils,
  Coffee,
  Wallet,
  DollarSign,
  Briefcase,
  Activity,
  HeartPulse,
  Monitor,
  Smartphone,
  Music,
  Video,
  Book,
  Plane,
  Train,
  Gift,
  Smile,
  Zap,
  Tag,
  CreditCard,
  Building,
  Wrench,
  Droplet,
  Flame,
  Wifi,
  Ticket,
  GraduationCap,
  Baby,
  Dog,
  Gamepad,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Landmark,
  CircleHelp,
};

interface IconRendererProps {
  name: string | null | undefined;
  className?: string;
  fallbackIcon?: React.ElementType;
}

export const IconRenderer = ({
  name,
  className,
  fallbackIcon: FallbackIcon = CircleHelp,
}: IconRendererProps) => {
  const IconComponent = name ? AVAILABLE_ICONS[name] || FallbackIcon : FallbackIcon;
  return <IconComponent className={cn("w-4 h-4", className)} />;
};

interface IconSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const IconSelector = ({ value, onValueChange, className }: IconSelectorProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <IconRenderer name={value} />
                <span className="truncate">{value}</span>
              </>
            ) : (
              "Select icon..."
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2">
        <div className="grid grid-cols-6 gap-1 max-h-[300px] overflow-y-auto">
          {Object.keys(AVAILABLE_ICONS).map((iconName) => {
            const isSelected = value === iconName;
            return (
              <Button
                key={iconName}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => {
                  onValueChange(iconName);
                  setOpen(false);
                }}
                title={iconName}
              >
                <IconRenderer name={iconName} />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
