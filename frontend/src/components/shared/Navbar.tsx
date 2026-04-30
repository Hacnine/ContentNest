import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          ContentNest
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition">Blog</Link>
          <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition">Sign In</Link>
          <Link
            href="/admin"
            className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
