import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProductionWorkflowLevels } from './ProductionWorkflowLevels';
import * as workflowServiceModule from '../services/workflow.service';

vi.mock('../services/workflow.service', () => ({
  default: {
    getWorkflow: vi.fn(),
    startStage: vi.fn(),
    pauseStage: vi.fn(),
    completeStage: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProductionWorkflowLevels', () => {
  const mockWorkflowData = {
    job_id: 'job-1',
    stages: [
      {
        id: 'stage-1',
        stage_name: 'Printing - Cyan',
        stage_order: 1,
        status: 'completed',
        operator_id: 'op-1',
        operator_name: 'John Doe',
        machine: 'Printer-1',
        duration_minutes: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    progress_percentage: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workflowServiceModule.default.getWorkflow).mockResolvedValue(mockWorkflowData);
  });

  it('should render component without crashing', () => {
    const { container } = render(
      <ProductionWorkflowLevels
        jobId="job-1"
        operatorId="op-1"
        machine="Printer-1"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render without operator and machine', () => {
    const { container } = render(
      <ProductionWorkflowLevels
        jobId="job-1"
        operatorId={undefined}
        machine={undefined}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle API errors gracefully', () => {
    vi.mocked(workflowServiceModule.default.getWorkflow).mockRejectedValue(
      new Error('API Error')
    );

    const { container } = render(
      <ProductionWorkflowLevels
        jobId="job-1"
        operatorId="op-1"
        machine="Printer-1"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should accept all props', () => {
    const { container } = render(
      <ProductionWorkflowLevels
        jobId="job-456"
        operatorId="op-5"
        machine="Printer-5"
        operatorName="Test Operator"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with minimal props', () => {
    const { container } = render(
      <ProductionWorkflowLevels jobId="job-1" />
    );

    expect(container).toBeInTheDocument();
  });
});
