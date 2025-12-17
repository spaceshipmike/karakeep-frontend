"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createListClient, updateListClient, deleteListClient, type CreateListInput } from "@/lib/karakeep";
import { useToast } from "@/components/ui/ToastProvider";
import { Icon, ICON_OPTIONS, ICON_LABELS, type IconName } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import type { List } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QueryBuilder } from "./QueryBuilder";

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (list: List) => void;
  /** If provided, edit this list instead of creating a new one */
  list?: List;
  /** Parent list ID for creating child lists */
  parentId?: string | null;
  /** All available lists for parent collection selector */
  allLists?: List[];
}

/**
 * EditListModal - Create or edit a collection
 *
 * Supports creating manual lists with name, icon, and optional description.
 */
export function EditListModal({
  isOpen,
  onClose,
  onSuccess,
  list,
  parentId: initialParentId,
  allLists,
}: EditListModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("bookmark");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isSmartList, setIsSmartList] = useState(false);
  const [query, setQuery] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const isEdit = !!list;
  // In edit mode, check if the list has a query (is a smart list)
  // Smart lists with query cannot be converted to manual lists
  const isExistingSmartList = isEdit && !!list?.query;

  // Initialize form when modal opens or list changes
  useEffect(() => {
    if (isOpen) {
      if (list) {
        setName(list.name);
        setIcon(list.icon || "bookmark");
        setDescription(""); // API doesn't return description in list response
        setParentId(list.parentId);
        setIsSmartList(!!list.query);
        setQuery(list.query || "");
      } else {
        setName("");
        setIcon("bookmark");
        setDescription("");
        setParentId(initialParentId || null);
        setIsSmartList(false);
        setQuery("");
      }
      setShowIconPicker(false);
      // Focus name input after a short delay
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, list, initialParentId]);

  if (!isOpen) return null;

  // Helper to flatten lists with hierarchical display
  const getFlattenedLists = (): Array<{ list: List; depth: number }> => {
    if (!allLists) return [];

    const flattened: Array<{ list: List; depth: number }> = [];
    const currentListId = list?.id;

    const addList = (l: List, depth: number) => {
      // Filter out smart lists (have query property) and current list being edited
      if (!l.query && l.id !== currentListId) {
        flattened.push({ list: l, depth });
      }
      // Recursively add children
      if (l.children && l.children.length > 0) {
        l.children.forEach((child) => addList(child, depth + 1));
      }
    };

    allLists.forEach((l) => addList(l, 0));
    return flattened;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (name.length > 40) {
      toast.error("Name must be at most 40 characters");
      return;
    }

    setIsLoading(true);

    try {
      let result: List;

      if (isEdit && list) {
        result = await updateListClient(list.id, {
          name: name.trim(),
          icon,
          description: description.trim() || undefined,
          parentId: isSmartList ? null : (parentId || null),
          query: isSmartList ? query : undefined,
        });
        toast.success("Collection updated");
      } else {
        const input: CreateListInput = {
          name: name.trim(),
          icon,
          type: isSmartList ? "smart" : "manual",
        };
        if (description.trim()) {
          input.description = description.trim();
        }
        if (isSmartList) {
          input.query = query;
        } else if (parentId) {
          input.parentId = parentId;
        }
        result = await createListClient(input);
        toast.success(isSmartList ? "Smart list created" : "Collection created");
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!list) return;

    setIsLoading(true);

    try {
      await deleteListClient(list.id);
      toast.success("Collection deleted");
      onSuccess?.(list); // Notify parent to refresh
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete collection");
    } finally {
      setIsLoading(false);
    }
  };

  // Use portal to render at document body level, avoiding stacking context issues
  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-list-modal-title"
    >
      <div className="relative z-[101] mx-4 w-full max-w-md rounded-lg border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2
              id="edit-list-modal-title"
              className="font-display text-xl font-medium text-card-foreground"
            >
              {isEdit ? "Edit Collection" : "New Collection"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {/* Icon and Name */}
            <div className="flex gap-3">
              {/* Icon Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Choose icon"
                >
                  <Icon name={icon} size={20} />
                </button>

                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-md border border-border bg-card p-3 shadow-lg">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Choose an icon</p>
                    <div className="grid grid-cols-5 gap-1">
                      {ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setIcon(iconName);
                            setShowIconPicker(false);
                          }}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted",
                            icon === iconName && "bg-primary/10 text-primary"
                          )}
                          title={ICON_LABELS[iconName]}
                        >
                          <Icon name={iconName} size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Name Input */}
              <div className="flex-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Collection name"
                  maxLength={40}
                  required
                />
              </div>
            </div>

            {/* Character count */}
            <p className="text-right text-xs text-muted-foreground">
              {name.length}/40
            </p>

            {/* Description */}
            <div>
              <label
                htmlFor="list-description"
                className="block text-sm font-medium text-card-foreground"
              >
                Description{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={100}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Brief description of this collection..."
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {description.length}/100
              </p>
            </div>

            {/* Smart List Toggle - only show when creating new or editing existing smart list */}
            {(!isEdit || isExistingSmartList) && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="space-y-0.5">
                  <label
                    htmlFor="smart-list-toggle"
                    className="text-sm font-medium text-card-foreground cursor-pointer"
                  >
                    Smart List
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically show bookmarks matching a search query
                  </p>
                </div>
                <button
                  id="smart-list-toggle"
                  type="button"
                  role="switch"
                  aria-checked={isSmartList}
                  disabled={isExistingSmartList}
                  onClick={() => !isExistingSmartList && setIsSmartList(!isSmartList)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSmartList ? "bg-primary" : "bg-muted",
                    isExistingSmartList && "cursor-not-allowed opacity-70"
                  )}
                  title={isExistingSmartList ? "Smart lists cannot be converted to manual lists" : undefined}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                      isSmartList ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            )}

            {/* Smart List Query Builder */}
            {isSmartList && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <QueryBuilder
                  value={query}
                  onChange={setQuery}
                  availableTags={[]} // TODO: Pass available tags from parent
                />
              </div>
            )}

            {/* Parent Collection - only show if allLists provided and NOT a smart list */}
            {!isSmartList && allLists && allLists.length > 0 && (() => {
              const flattenedLists = getFlattenedLists();
              return flattenedLists.length > 0 ? (
                <div>
                  <label
                    htmlFor="parent-collection"
                    className="block text-sm font-medium text-card-foreground"
                  >
                    Parent Collection{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <select
                    id="parent-collection"
                    value={parentId || ""}
                    onChange={(e) => setParentId(e.target.value || null)}
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">None (top-level)</option>
                    {flattenedLists.map(({ list: l, depth }) => (
                      <option key={l.id} value={l.id}>
                        {'\u00A0'.repeat(depth * 4)}{l.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null;
            })()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            {/* Left side - Delete button (only in edit mode) */}
            {isEdit ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950 dark:hover:border-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Delete collection"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            ) : (
              <div />
            )}

            {/* Right side - Cancel and Save */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
                  isLoading || !name.trim()
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message={
          <>
            Delete <strong>{list?.name}</strong>? This cannot be undone.
          </>
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );

  // Render via portal to escape sidebar stacking context
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
