import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StageApprovalStatus } from './StageApprovalStatus';
import api from '../services/api';

vi.mock('../services/api');

describe('StageApprovalStatus', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (stageId: string = 'stage-1') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <StageApprovalStatus stageId={stageId} />
      </QueryClientProvider>
    );
  };

  it('should render loading state initially', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    const { container } = renderComponent();
    const loadingElement = container.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render approved status', async () => {
    const mockData = {
      data: {
        stage_id: 'stage-1',
        status: 'approved',
        qa_manager_name: 'John Doe',
        approved_at: '2026-03-10T10:00:00Z',
        created_at: '2026-03-10T09:00:00Z',
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('QA Approval Status')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
  });

  it('should render rejected status with reason', async () => {
    const mockData = {
      data: {
        stage_id: 'stage-1',
        status: 'rejected',
        qa_manager_name: 'Jane Smith',
        rejection_reason: 'Quality issues detected',
        created_at: '2026-03-10T09:00:00Z',
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('rejected')).toBeInTheDocument();
      expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
      expect(screen.getByText('Quality issues detected')).toBeInTheDocument();
    });
  });

  it('should render pending status', async () => {
    const mockData = {
      data: {
        stage_id: 'stage-1',
        status: 'pending',
        created_at: '2026-03-10T09:00:00Z',
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText(/Awaiting QA manager approval/)).toBeInTheDocument();
    });
  });

  it('should call API with correct stage ID', async () => {
    const mockData = {
      data: {
        stage_id: 'stage-123',
        status: 'pending',
        created_at: '2026-03-10T09:00:00Z',
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    renderComponent('stage-123');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/api/production/workflow-approval/stage/stage-123/status'
      );
    });
  });

  it('should return null when no approval status data', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: null });

    const { container } = renderComponent();

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
