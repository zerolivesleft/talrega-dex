import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PageContainer({ children, className, style }: PageContainerProps) {
  return (
    <main className={cn("mx-auto max-w-7xl px-4 py-6", className)} style={style}>
      {children}
    </main>
  );
}
