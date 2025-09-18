'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';
import { mockUsers } from '@/lib/data';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (userId: string) => {
    login(userId);
    router.push('/dashboard');
  };
  
  const userAccounts = mockUsers.filter(u => u.role === 'user');
  const adminAccount = mockUsers.find(u => u.role === 'admin');

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to ParkWise</CardTitle>
          <CardDescription>Select a role to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground text-center">User Accounts</h3>
            {userAccounts.map(user => (
              <Button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full"
                size="lg"
              >
                <User className="mr-2 h-5 w-5" />
                Login as {user.name}
              </Button>
            ))}
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {adminAccount && (
              <Button
                onClick={() => handleLogin(adminAccount.id)}
                className="w-full"
                variant="secondary"
                size="lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Login as Admin
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
