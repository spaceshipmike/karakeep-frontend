import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-background px-6 py-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Karakeep
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Personal Bookmark Library
        </p>
      </div>
    </footer>
  );
}
