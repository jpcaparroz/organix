import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "../../lib/utils/ui";
import { Search, Image as ImageIcon } from "lucide-react";

// Using Vite's import.meta.glob to list all payment method logos
const logosGlob = import.meta.glob('/public/payment-method-logos/*.png');
// Extract filenames, for example: "visa.png"
const AVAILABLE_LOGOS = Object.keys(logosGlob).map((path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
});

export interface LogoSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const LogoSelector = ({ value, onValueChange, className }: LogoSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredLogos = React.useMemo(() => {
    if (!search) return AVAILABLE_LOGOS;
    const lowerSearch = search.toLowerCase();
    return AVAILABLE_LOGOS.filter(logo => logo.toLowerCase().includes(lowerSearch));
  }, [search]);

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
                  <img 
                    src={`/payment-method-logos/${value}`} 
                    alt={value} 
                    className="w-5 h-5 object-contain rounded-full ring-1 ring-border bg-white" 
                    onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                  }}
                />
                <span className="truncate">{value.replace('.png', '')}</span>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>Select logo...</span>
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            placeholder="Search logos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="p-2">
          <div className="grid grid-cols-5 gap-1 max-h-[300px] overflow-y-auto p-1">
            {filteredLogos.length > 0 ? (
              filteredLogos.map((logoName) => {
                const isSelected = value === logoName;
                return (
                  <Button
                    key={logoName}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 shrink-0 overflow-hidden",
                      isSelected && "bg-primary/10 ring-2 ring-primary"
                    )}
                    onClick={() => {
                      onValueChange(logoName);
                      setOpen(false);
                    }}
                    title={logoName.replace('.png', '')}
                  >
                    <img 
                      src={`/payment-method-logos/${logoName}`} 
                      alt={logoName} 
                      className="w-8 h-8 object-contain rounded-full ring-1 ring-border bg-white"
                      loading="lazy"
                    />
                  </Button>
                );
              })
            ) : (
              <div className="col-span-5 py-6 text-center text-sm text-muted-foreground">
                No logos found.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
