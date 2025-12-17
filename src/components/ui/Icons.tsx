"use client";

import * as LucideIcons from "lucide-react";
import { ALL_ICONS, ICON_LABELS, type IconName } from "@/lib/icon-config";

// Re-export configuration for consumers
export { ALL_ICONS as ICON_OPTIONS, ICON_LABELS } from "@/lib/icon-config";
export type { IconName } from "@/lib/icon-config";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Convert kebab-case to PascalCase for Lucide import lookup
 * Examples: "bookmark" -> "Bookmark", "git-branch" -> "GitBranch"
 */
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Icon component - Wraps Lucide icons for consistent usage
 */
export function Icon({ name, className, size = 16 }: IconProps) {
  const pascalName = toPascalCase(name);
  const LucideIcon = (LucideIcons as Record<string, any>)[pascalName];

  if (!LucideIcon) {
    // Fallback to Bookmark icon if not found
    const BookmarkIcon = LucideIcons.Bookmark;
    return <BookmarkIcon size={size} className={className} />;
  }

  return <LucideIcon size={size} className={className} />;
}
