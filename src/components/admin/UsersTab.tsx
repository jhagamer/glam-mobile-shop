
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { User } from '@/types/admin';

interface UsersTabProps {
  users: User[];
  onPromoteToAdmin: (userId: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  onPromoteToAdmin
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Users Management</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.email}</h3>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.roles.includes('admin') ? "default" : "secondary"}>
                    {user.roles.includes('admin') ? 'Admin' : 'Consumer'}
                  </Badge>
                  {!user.roles.includes('admin') && (
                    <Button
                      size="sm"
                      onClick={() => onPromoteToAdmin(user.id)}
                      className="bg-gradient-to-r from-rose-500 to-purple-600"
                    >
                      <Crown className="h-4 w-4 mr-1" />
                      Promote to Admin
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
