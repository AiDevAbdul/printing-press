'use client';

import { Card } from '@/components/ui/Card';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Page under construction - API integration coming in Phase 4
        </p>
      </div>
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">
            This page is being migrated from the old frontend.
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
            See frontend.old/src/pages for the original implementation.
          </p>
        </div>
      </Card>
    </div>
  );
}
