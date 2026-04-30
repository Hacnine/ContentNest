'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/media', label: 'Media', icon: '🖼️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-background border-r border-border z-30 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        {sidebarOpen ? (
          <Link href="/" className="text-lg font-bold text-primary truncate">ContentNest</Link>
        ) : (
          <Link href="/" className="text-lg font-bold text-primary">CN</Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="h-12 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition"
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </aside>
  );
}
