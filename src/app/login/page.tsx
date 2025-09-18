'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: 'user' | 'admin') => {
    login(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to ParkWise</CardTitle>
          <CardDescription>Select a role to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => handleLogin('user')}
              className="w-full"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              Login as User
            </Button>
            <Button
              onClick={() => handleLogin('admin')}
              className="w-full"
              variant="secondary"
              size="lg"
            >
              <Shield className="mr-2 h-5 w-5" />
              Login as Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
