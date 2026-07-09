import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageShell({ children, hero = false }: { children: ReactNode; hero?: boolean }) {
  return (
    <div className={`min-h-screen flex flex-col ${hero ? "bg-gradient-hero" : "bg-background"}`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
