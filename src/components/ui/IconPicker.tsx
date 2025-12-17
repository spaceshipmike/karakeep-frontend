"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CURATED_ICONS, ICON_LABELS, type IconCategory } from "@/lib/icon-config";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

const categories: Array<IconCategory | "all"> = [
  "all",
  "general",
  "tech",
  "dev",
  "communication",
  "media",
  "business",
  "personal",
  "navigation",
  "misc",
];

const categoryLabels: Record<IconCategory | "all", string> = {
  all: "All",
  general: "General",
  tech: "Tech",
  dev: "Dev",
  communication: "Communication",
  media: "Media",
  business: "Business",
  personal: "Personal",
  navigation: "Navigation",
  misc: "Misc",
};

/**
 * Get icons for selected category
 */
function getIconsForCategory(cat: IconCategory | "all"): readonly string[] {
  if (cat === "all") {
    return Object.values(CURATED_ICONS).flat();
  }
  return CURATED_ICONS[cat];
}

/**
 * IconPicker - Dropdown component for selecting an icon
 *
 * Features:
 * - Category tabs for filtering
 * - Search input to filter by name
 * - 6-column grid with tooltips
 * - Selected icon highlighting
 */
export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter icons based on category and search
  const filteredIcons = useMemo(() => {
    const categoryIcons = getIconsForCategory(selectedCategory);

    if (!searchQuery.trim()) {
      return categoryIcons;
    }

    const query = searchQuery.toLowerCase();
    return categoryIcons.filter((iconName) => {
      const label = ICON_LABELS[iconName]?.toLowerCase() || iconName.toLowerCase();
      return label.includes(query) || iconName.includes(query);
    });
  }, [selectedCategory, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        title={ICON_LABELS[value] || "Choose icon"}
        aria-label="Choose icon"
        aria-expanded={isOpen}
      >
        <Icon name={value} size={20} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 w-[440px] rounded-lg border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header with Search */}
          <div className="border-b border-border p-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="border-b border-border px-3 pt-3">
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid */}
          <div className="max-h-[320px] overflow-y-auto p-3">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelectIcon(iconName)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-md transition-colors hover:bg-muted",
                      value === iconName
                        ? "bg-primary/10 text-primary ring-2 ring-primary ring-offset-2 ring-offset-card"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title={ICON_LABELS[iconName] || iconName}
                    aria-label={ICON_LABELS[iconName] || iconName}
                  >
                    <Icon name={iconName} size={20} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No icons found
              </div>
            )}
          </div>

          {/* Footer with icon count */}
          <div className="border-t border-border px-3 py-2 text-center text-xs text-muted-foreground">
            {filteredIcons.length} {filteredIcons.length === 1 ? "icon" : "icons"}
          </div>
        </div>
      )}
    </div>
  );
}
