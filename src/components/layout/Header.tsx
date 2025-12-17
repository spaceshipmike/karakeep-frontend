"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({
  onMenuToggle,
  showMenuButton = false,
  className,
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      {/* Mobile menu button */}
      {showMenuButton && (
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Toggle menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
        <div
          className={cn(
            "relative flex items-center rounded-lg border transition-all duration-200",
            isFocused
              ? "border-primary/50 ring-2 ring-primary/20"
              : "border-input hover:border-input/80"
          )}
        >
          <Icon
            name="search"
            className={cn(
              "absolute left-3 h-4 w-4 transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}
          />
          <input
            type="search"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-10 w-full bg-transparent pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
