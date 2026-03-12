import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, AlertCircle } from 'lucide-react';
import costingService, { CostingConfig } from '../../services/costing.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export default function CostingConfig() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<CostingConfig>>({
    labor_cost_per_hour: 0,
    machine_cost_per_hour: 0,
    material_waste_percentage: 0,
    overhead_percentage: 0,
    profit_margin_percentage: 0,
  });
  const [successMessage, setSuccessMessage] = useState('');

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['costing-config'],
    queryFn: () => costingService.getConfig(),
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CostingConfig>) => costingService.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing-config'] });
      setSuccessMessage('Configuration updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof CostingConfig, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading configuration...</div>;
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        Failed to load costing configuration
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Costing Configuration</h1>
        <p className="text-gray-600 mt-1">Manage system-wide costing parameters</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Configuration Form */}
      <Card variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Labor & Machine Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Labor Cost Per Hour (₹)"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_cost_per_hour || 0}
                onChange={(e) => handleChange('labor_cost_per_hour', Number(e.target.value))}
                placeholder="e.g., 500"
              />
              <p className="text-xs text-gray-500 mt-1">Hourly rate for labor calculations</p>
            </div>

            <div>
              <Input
                label="Machine Cost Per Hour (₹)"
                type="number"
                step="0.01"
                min="0"
                value={formData.machine_cost_per_hour || 0}
                onChange={(e) => handleChange('machine_cost_per_hour', Number(e.target.value))}
                placeholder="e.g., 1000"
              />
              <p className="text-xs text-gray-500 mt-1">Hourly rate for machine usage</p>
            </div>
          </div>

          {/* Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Input
                label="Material Waste Percentage (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.material_waste_percentage || 0}
                onChange={(e) => handleChange('material_waste_percentage', Number(e.target.value))}
                placeholder="e.g., 5"
              />
              <p className="text-xs text-gray-500 mt-1">Expected waste in material</p>
            </div>

            <div>
              <Input
                label="Overhead Percentage (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.overhead_percentage || 0}
                onChange={(e) => handleChange('overhead_percentage', Number(e.target.value))}
                placeholder="e.g., 10"
              />
              <p className="text-xs text-gray-500 mt-1">Overhead costs as % of total</p>
            </div>

            <div>
              <Input
                label="Profit Margin Percentage (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.profit_margin_percentage || 0}
                onChange={(e) => handleChange('profit_margin_percentage', Number(e.target.value))}
                placeholder="e.g., 20"
              />
              <p className="text-xs text-gray-500 mt-1">Target profit margin</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">These settings affect:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Auto-calculated job costs</li>
                <li>Quotation pricing calculations</li>
                <li>Cost analysis and reporting</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>

          {updateMutation.isError && (
            <Alert variant="error" title="Error">
              Failed to update configuration
            </Alert>
          )}
        </form>
      </Card>

      {/* Last Updated */}
      {config && (
        <Card variant="outlined" className="p-4">
          <p className="text-sm text-gray-600">
            Last updated: {new Date(config.updated_at).toLocaleString()}
          </p>
        </Card>
      )}
    </div>
  );
}
