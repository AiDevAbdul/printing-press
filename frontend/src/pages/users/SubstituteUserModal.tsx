import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import axios from 'axios';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface SubstituteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function SubstituteUserModal({ isOpen, onClose, userId, userName }: SubstituteUserModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    substitute_user_id: '',
    substitute_start_date: '',
    substitute_end_date: '',
    substitute_reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users?limit=100');
      setUsers(response.data.users.filter((u: User) => u.id !== userId));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.substitute_user_id || !formData.substitute_start_date || !formData.substitute_end_date) {
        setError('Please fill in all required fields');
        return;
      }

      const startDate = new Date(formData.substitute_start_date);
      const endDate = new Date(formData.substitute_end_date);

      if (startDate >= endDate) {
        setError('Start date must be before end date');
        return;
      }

      await axios.post(`/api/users/${userId}/substitute`, formData);

      toast.success('Substitute user assigned successfully');
      setFormData({
        substitute_user_id: '',
        substitute_start_date: '',
        substitute_end_date: '',
        substitute_reason: '',
      });
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to assign substitute user';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Substitute for ${userName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Substitute User *
          </label>
          <Select
            name="substitute_user_id"
            value={formData.substitute_user_id}
            onChange={handleChange}
            required
            options={[
              { value: '', label: 'Select a user' },
              ...users.map(user => ({
                value: user.id,
                label: `${user.full_name} (${user.email})`,
              })),
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <Input
            type="date"
            name="substitute_start_date"
            value={formData.substitute_start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <Input
            type="date"
            name="substitute_end_date"
            value={formData.substitute_end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            name="substitute_reason"
            value={formData.substitute_reason}
            onChange={handleChange}
            placeholder="Enter reason for substitution (e.g., leave, training)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Substitute'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
