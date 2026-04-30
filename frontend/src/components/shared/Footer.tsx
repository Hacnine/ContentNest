import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-primary">
            ContentNest
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ContentNest. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition">Blog</Link>
            <Link href="/admin" className="hover:text-foreground transition">Admin</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
