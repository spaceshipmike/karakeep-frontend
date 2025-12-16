"use client";

import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

/**
 * KeyboardNavigationProvider - Enables global keyboard shortcuts
 *
 * Wrap the app with this to enable shortcuts like:
 * - / : Focus search
 * - Escape : Clear focus
 */
export function KeyboardNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardNavigation();
  return <>{children}</>;
}
