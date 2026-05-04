import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  sales: 'bg-blue-100 text-blue-800',
  planner: 'bg-green-100 text-green-800',
  accounts: 'bg-yellow-100 text-yellow-800',
  inventory: 'bg-orange-100 text-orange-800',
};

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'sales',
  });

  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const users = usersData?.users || [];

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await api.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'sales',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await api.patch(`/users/${id}`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading users"
          description="There was an error loading the users. Please try again."
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No users found"
          description="Get started by creating your first user."
          action={{
            label: 'Add User',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user: User) => (
            <Card key={user.id} variant="elevated">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Status:</span> {user.is_active ? 'Active' : 'Inactive'}</p>
                  <p className="text-gray-600"><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <Button
                  variant={user.is_active ? 'danger' : 'primary'}
                  size="sm"
                  fullWidth
                  onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: !user.is_active })}
                  disabled={toggleActiveMutation.isPending}
                >
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
          />
          <Input
            label="Email *"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />
          <Input
            label="Password *"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            helperText="Minimum 6 characters"
          />
          <Select
            label="Role *"
            options={[
              { value: 'sales', label: 'Sales' },
              { value: 'planner', label: 'Planner' },
              { value: 'accounts', label: 'Accounts' },
              { value: 'inventory', label: 'Inventory' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Error creating user
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
