import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for displaying content. Supports multiple variants and can contain any content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'glass'],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default Card',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'Elevated Card',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined Card',
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Card',
  },
};

export const WithContent: Story = {
  render: () => (
    <Card variant="default" className="w-80">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-gray-600">
          This is a card with more detailed content. It can contain any React elements.
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Action
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default">
        <h4 className="font-semibold mb-2">Default</h4>
        <p className="text-sm text-gray-600">Standard card style</p>
      </Card>
      <Card variant="elevated">
        <h4 className="font-semibold mb-2">Elevated</h4>
        <p className="text-sm text-gray-600">With shadow elevation</p>
      </Card>
      <Card variant="outlined">
        <h4 className="font-semibold mb-2">Outlined</h4>
        <p className="text-sm text-gray-600">With border outline</p>
      </Card>
      <Card variant="glass">
        <h4 className="font-semibold mb-2">Glass</h4>
        <p className="text-sm text-gray-600">Glass morphism effect</p>
      </Card>
    </div>
  ),
};
