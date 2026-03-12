import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import { User, Mail, Phone, Building2, Calendar, Edit2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import activityLogService, { ActivityLog } from '../../services/activity-log.service';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  system_access: string[];
  partial_access: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileId = userId || currentUser?.id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchActivityLog();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile
        ? '/users/profile'
        : `/users/${profileId}/profile`;
      const response = await api.get(endpoint);
      setProfile(response.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await activityLogService.getUserActivityLog(profileId, 50, 0);
      setActivityLog(response.data || []);
    } catch (err) {
      console.error('Failed to load activity log:', err);
      setActivityLog([]);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <Alert variant="error" title="Error">{error || 'Profile not found'}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <h1 className="text-3xl font-bold">User Profile</h1>
        </div>
        {isOwnProfile && (
          <Button
            variant="primary"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            <Edit2 size={18} />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card variant="elevated" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Basic Info */}
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{profile.full_name}</h2>
            <Badge className={getRoleColor(profile.role)}>
              {profile.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Contact & Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.department && (
                <div className="flex items-start gap-3">
                  <Building2 size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{profile.department}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Bio</p>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Permissions Card */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-xl font-bold mb-4">Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Access */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">System Access</h4>
            <div className="space-y-2">
              {profile.system_access.length > 0 ? (
                profile.system_access.map(module => (
                  <div key={module} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700">{module}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No system access</p>
              )}
            </div>
          </div>

          {/* Partial Access */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Module Permissions</h4>
            <div className="space-y-3">
              {Object.entries(profile.partial_access).length > 0 ? (
                Object.entries(profile.partial_access).map(([module, actions]) => (
                  <div key={module}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{module}</p>
                    <div className="flex flex-wrap gap-1">
                      {actions.map(action => (
                        <Badge key={action} className="bg-blue-100 text-blue-800 text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No module permissions</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Log */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityLog.length > 0 ? (
            activityLog.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{formatAction(log.action)}</p>
                  {log.entity_type && (
                    <p className="text-sm text-gray-500">
                      {log.entity_type}
                      {log.entity_id && ` #${log.entity_id}`}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(log.created_at)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
