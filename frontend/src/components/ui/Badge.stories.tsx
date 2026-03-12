import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component for displaying status, priority, and other labels. Supports multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Badge text content',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Completed',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Failed',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'In Progress',
  },
};

export const WithStatus: Story = {
  args: {
    variant: 'status',
    status: 'pending',
    children: 'Pending',
  },
};

export const WithPriority: Story = {
  args: {
    variant: 'priority',
    priority: 'high',
    children: 'High Priority',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const AllVariantsExtended: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="status" status="pending">Pending</Badge>
      <Badge variant="priority" priority="high">High</Badge>
    </div>
  ),
};
