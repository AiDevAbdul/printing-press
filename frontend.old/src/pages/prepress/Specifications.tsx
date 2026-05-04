import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { ProductSpecification, SpecificationStats } from './specification-types';
import SpecificationsGrid from './SpecificationsGrid';
import SpecificationsList from './SpecificationsList';
import SpecificationFormModal from './SpecificationFormModal';
import api from '../../services/api';

export default function Specifications() {
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [filteredSpecs, setFilteredSpecs] = useState<ProductSpecification[]>([]);
  const [stats, setStats] = useState<SpecificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<ProductSpecification | null>(null);

  useEffect(() => {
    fetchSpecifications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterSpecifications();
  }, [specifications, searchQuery, statusFilter]);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prepress/specifications');
      setSpecifications(response.data);
    } catch (error) {
      console.error('Failed to fetch specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/prepress/stats/specifications');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterSpecifications = () => {
    let filtered = specifications;

    if (searchQuery) {
      filtered = filtered.filter(
        (spec) =>
          spec.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.file_folder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.form_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((spec) => spec.status === statusFilter);
    }

    setFilteredSpecs(filtered);
  };

  const handleCreateSpec = async (data: any) => {
    try {
      await api.post('/prepress/specifications', data);
      setShowFormModal(false);
      setEditingSpec(null);
      fetchSpecifications();
      fetchStats();
    } catch (error) {
      console.error('Failed to create specification:', error);
    }
  };

  const handleUpdateSpec = async (data: any) => {
    if (!editingSpec) return;
    try {
      await api.put(`/prepress/specifications/${editingSpec.id}`, data);
      setShowFormModal(false);
      setEditingSpec(null);
      fetchSpecifications();
      fetchStats();
    } catch (error) {
      console.error('Failed to update specification:', error);
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (!confirm('Are you sure you want to delete this specification?')) return;
    try {
      await api.delete(`/prepress/specifications/${specId}`);
      fetchSpecifications();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete specification:', error);
    }
  };

  const handleEditSpec = (spec: ProductSpecification) => {
    setEditingSpec(spec);
    setShowFormModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Specifications</h1>
        <p className="text-gray-600 mt-1">Manage product specifications and approvals</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Draft</p>
            <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, folder, or form number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => {
              setEditingSpec(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            New Specification
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading specifications...</p>
        </div>
      ) : filteredSpecs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No specifications found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <SpecificationsGrid
          specifications={filteredSpecs}
          onEdit={handleEditSpec}
          onDelete={handleDeleteSpec}
          getStatusColor={getStatusColor}
        />
      ) : (
        <SpecificationsList
          specifications={filteredSpecs}
          onEdit={handleEditSpec}
          onDelete={handleDeleteSpec}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Form Modal */}
      {showFormModal && (
        <SpecificationFormModal
          specification={editingSpec}
          onSubmit={editingSpec ? handleUpdateSpec : handleCreateSpec}
          onClose={() => {
            setShowFormModal(false);
            setEditingSpec(null);
          }}
        />
      )}
    </div>
  );
}
