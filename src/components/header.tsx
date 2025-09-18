'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href ? "text-primary" : "text-muted-foreground"
    )}>
        {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          {user?.role === 'admin' && (
            <>
                <NavLink href="/admin/pricing">Pricing</NavLink>
                <NavLink href="/admin/reports">Reports</NavLink>
            </>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
                <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.name}</span>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
