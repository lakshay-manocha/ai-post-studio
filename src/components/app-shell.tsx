import { Outlet, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Link to="/" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
                Postwright
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild aria-label="Source">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
