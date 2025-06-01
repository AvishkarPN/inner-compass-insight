
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Create an account to sync your data across devices and never lose your mood journal.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{user.email}</span>
        </div>
        
        {user.user_metadata?.full_name && (
          <div className="text-sm">
            <span className="font-medium">Name: </span>
            <span>{user.user_metadata.full_name}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Account created: {new Date(user.created_at).toLocaleDateString()}
        </div>
        
        <Button 
          onClick={signOut} 
          variant="outline" 
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
