import { useState, useEffect } from 'react';
import { Plus, Search, Grid3x3, List } from 'lucide-react';
import api from '../../services/api';
import { Design, Stats } from './types';
import PrepressGrid from './PrepressGrid';
import PrepressList from './PrepressList';
import DesignFormModal from './DesignFormModal';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'in_design' | 'waiting_for_data' | 'approved' | 'rejected';
type FilterCategory = 'all' | 'commercial' | 'logo' | 'product' | 'other';

export default function Prepress() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchDesigns();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [designs, searchQuery, statusFilter, categoryFilter]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prepress/designs');
      setDesigns(response.data);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/prepress/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = designs;

    if (searchQuery) {
      filtered = filtered.filter(
        (design) =>
          design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          design.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((design) => design.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((design) => design.product_category === categoryFilter);
    }

    setFilteredDesigns(filtered);
  };

  const handleAddDesign = () => {
    setSelectedDesign(null);
    setIsFormOpen(true);
  };

  const handleEditDesign = (design: Design) => {
    setSelectedDesign(design);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDesign(null);
  };

  const handleFormSubmit = async () => {
    await fetchDesigns();
    await fetchStats();
    handleFormClose();
  };

  const handleDeleteDesign = async (designId: string) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      try {
        await api.delete(`/prepress/designs/${designId}`);
        await fetchDesigns();
        await fetchStats();
      } catch (error) {
        console.error('Failed to delete design:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CPP Pre-Press</h1>
              <p className="text-gray-600 mt-1">Design Management & Workflow</p>
            </div>
            <button
              onClick={handleAddDesign}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              New Design
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">In Design</p>
                <p className="text-2xl font-bold text-blue-900">{stats.inDesign}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Waiting</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.waitingForData}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="in_design">In Design</option>
                <option value="waiting_for_data">Waiting for Data</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="commercial">Commercial</option>
                <option value="logo">Logo</option>
                <option value="product">Product</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No designs found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <PrepressGrid
            designs={filteredDesigns}
            onEdit={handleEditDesign}
            onDelete={handleDeleteDesign}
          />
        ) : (
          <PrepressList
            designs={filteredDesigns}
            onEdit={handleEditDesign}
            onDelete={handleDeleteDesign}
          />
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <DesignFormModal
          design={selectedDesign}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}
