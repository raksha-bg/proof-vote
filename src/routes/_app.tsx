import { createFileRoute, Outlet, Link, useNavigate, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { tokenStore } from "@/lib/api";
import { LayoutDashboard, Vote, BarChart3, Network, User as UserIcon, Shield, LogOut, Sun, Moon, Vote as VoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !tokenStore.access) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/elections", label: "Elections", icon: Vote },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/blockchain", label: "Blockchain", icon: Network },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-hero">
        <div className="glass-strong rounded-2xl p-6 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
          <span className="text-sm">Loading your account…</span>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-64 flex-col border-r glass-strong">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <VoteIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-gradient">BlockVote</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin") ? "bg-gradient-primary text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="glass rounded-xl p-3 flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
              {user.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.full_name}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                {user.role} · {user.verified ? "verified" : "unverified"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggle} className="flex-1">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }} className="flex-1">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 glass-strong border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <VoteIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-gradient text-sm">BlockVote</span>
          </Link>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t px-2 py-2 gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${pathname.startsWith("/admin") ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
              Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="flex-1 min-w-0 md:pt-0 pt-28">
        <Outlet />
      </div>
    </div>
  );
}
