import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import { Plus, Search, Edit2, Trash2, Users, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import { PermissionMatrix } from './PermissionMatrix';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/users?${params}`);
      setUsers(response.data.users || []);
      setTotalUsers(response.data.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      await api.post('/users', userData);
      toast.success('User created successfully');
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create user';
      toast.error(message);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;
    try {
      await api.patch(`/users/${selectedUser.id}`, userData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update user';
      toast.error(message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      qa_manager: 'bg-purple-100 text-purple-800',
      operator: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      sales: 'bg-yellow-100 text-yellow-800',
      planner: 'bg-indigo-100 text-indigo-800',
      accounts: 'bg-pink-100 text-pink-800',
      inventory: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'qa_manager', label: 'QA Manager' },
              { value: 'operator', label: 'Operator' },
              { value: 'analyst', label: 'Analyst' },
              { value: 'sales', label: 'Sales' },
              { value: 'planner', label: 'Planner' },
              { value: 'accounts', label: 'Accounts' },
              { value: 'inventory', label: 'Inventory' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </Card>

      {/* Error Alert */}
      {error && <Alert variant="error" title="Error">{error}</Alert>}

      {/* Users Table */}
      <Card variant="elevated" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{user.department || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPermissionsModal(true);
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Lock size={16} />
                          Permissions
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalUsers)} of{' '}
            {totalUsers} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={page === p ? 'primary' : 'outline'}
                  onClick={() => setPage(p)}
                  size="sm"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onSubmit={handleEditUser}
          />

          <PermissionMatrix
            isOpen={showPermissionsModal}
            onClose={() => {
              setShowPermissionsModal(false);
              setSelectedUser(null);
            }}
            userId={selectedUser.id}
            userName={selectedUser.full_name}
            currentRole={selectedUser.role}
          />

          <DeleteUserDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onConfirm={handleDeleteUser}
          />
        </>
      )}
    </div>
  );
}
