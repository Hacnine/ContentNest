'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';

export default function AdminHeader() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/auth/login');
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-20">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-muted-foreground hover:text-foreground transition md:hidden"
      >
        ☰
      </button>

      <div className="flex items-center gap-4 ml-auto">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
