import { ReactNode } from "react";

interface PageProps {
  children: ReactNode;
  className?: string;
}

export function Page({ children, className = "" }: PageProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}
        tabIndex={-1}
        role="main"
      >
        {children}
      </main>
    </>
  );
}
