
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/admin';

interface UsersTabProps {
  users: User[];
}

export const UsersTab: React.FC<UsersTabProps> = ({ users }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Users Management</h2>
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <strong>Note:</strong> Admin roles must be assigned manually through the database. 
        Contact your database administrator to promote users to admin.
      </div>
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
