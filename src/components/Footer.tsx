import { Link } from "@tanstack/react-router";
import { Vote, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t glass-strong">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Vote className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-gradient">BlockVote</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Secure, transparent, and tamper-proof elections powered by Ethereum smart contracts.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="mailto:hello@blockvote.io" aria-label="Email" className="hover:text-foreground"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Login</Link></li>
            <li><Link to="/register" className="hover:text-foreground">Register</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BlockVote. All rights reserved.
      </div>
    </footer>
  );
}
