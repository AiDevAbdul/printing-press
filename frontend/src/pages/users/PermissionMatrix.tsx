import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { Alert } from '../../components/ui/Alert';
import axios from 'axios';
import { toast } from 'sonner';

interface PermissionMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentRole: string;
}

const MODULES = [
  'Dashboard',
  'Orders',
  'Quotations',
  'Production',
  'Quality',
  'Dispatch',
  'Inventory',
  'Invoices',
  'Reports',
  'Settings',
  'User Management',
  'QA Dashboard',
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign'];

const ROLE_PRESETS: Record<string, { system_access: string[]; partial_access: Record<string, string[]> }> = {
  admin: {
    system_access: MODULES,
    partial_access: {
      Dashboard: ['view'],
      Orders: ['view', 'create', 'edit', 'delete', 'export'],
      Quotations: ['view', 'create', 'edit', 'delete'],
      Production: ['view', 'create', 'edit', 'delete', 'assign'],
      Quality: ['view', 'create', 'edit', 'delete'],
      Dispatch: ['view', 'create', 'edit', 'delete'],
      Inventory: ['view', 'create', 'edit', 'delete'],
      Invoices: ['view', 'create', 'edit', 'delete', 'export'],
      Reports: ['view', 'export'],
      Settings: ['view', 'edit'],
      'User Management': ['view', 'create', 'edit', 'delete'],
      'QA Dashboard': ['view'],
    },
  },
  qa_manager: {
    system_access: ['Dashboard', 'Production', 'Quality', 'QA Dashboard'],
    partial_access: {
      Dashboard: ['view'],
      Production: ['view'],
      Quality: ['view'],
      'QA Dashboard': ['view', 'approve'],
    },
  },
  operator: {
    system_access: ['Dashboard', 'Production'],
    partial_access: {
      Dashboard: ['view'],
      Production: ['view'],
    },
  },
  analyst: {
    system_access: ['Dashboard', 'Orders', 'Invoices', 'Inventory', 'Reports'],
    partial_access: {
      Dashboard: ['view'],
      Orders: ['view', 'export'],
      Invoices: ['view', 'export'],
      Inventory: ['view', 'export'],
      Reports: ['view', 'export'],
    },
  },
};

export function PermissionMatrix({ isOpen, onClose, userId, userName, currentRole }: PermissionMatrixProps) {
  const [systemAccess, setSystemAccess] = useState<string[]>(ROLE_PRESETS[currentRole]?.system_access || []);
  const [partialAccess, setPartialAccess] = useState<Record<string, string[]>>(
    ROLE_PRESETS[currentRole]?.partial_access || {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSystemAccessChange = (module: string) => {
    setSystemAccess(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const handleActionChange = (module: string, action: string) => {
    setPartialAccess(prev => {
      const moduleActions = prev[module] || [];
      return {
        ...prev,
        [module]: moduleActions.includes(action)
          ? moduleActions.filter(a => a !== action)
          : [...moduleActions, action],
      };
    });
  };

  const handleApplyPreset = (role: string) => {
    const preset = ROLE_PRESETS[role];
    if (preset) {
      setSystemAccess(preset.system_access);
      setPartialAccess(preset.partial_access);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.put(`/api/users/${userId}/permissions`, {
        system_access: systemAccess,
        partial_access: partialAccess,
      });

      toast.success('Permissions updated successfully');
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update permissions';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permissions for ${userName}`}>
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {/* Role Presets */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(ROLE_PRESETS).map(role => (
              <Button
                key={role}
                variant={currentRole === role ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleApplyPreset(role)}
                className="text-xs"
              >
                {role.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* System Access */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">System Access (Modules)</h4>
          <div className="grid grid-cols-2 gap-3">
            {MODULES.map(module => (
              <label key={module} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={systemAccess.includes(module)}
                  onChange={() => handleSystemAccessChange(module)}
                />
                <span className="text-sm text-gray-700">{module}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Partial Access */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Module Permissions (Actions)</h4>
          <div className="space-y-4">
            {systemAccess.map(module => (
              <Card key={module} variant="outlined" className="p-3">
                <p className="font-medium text-gray-900 mb-2">{module}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map(action => (
                    <label key={action} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={(partialAccess[module] || []).includes(action)}
                        onChange={() => handleActionChange(module, action)}
                      />
                      <span className="text-sm text-gray-700 capitalize">{action}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
