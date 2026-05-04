import React, { useState } from 'react';

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      <div
        className="flex gap-0 border-b border-[var(--color-border-subtle)] overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
                'transition-colors duration-fast focus:outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
                isActive
                  ? 'text-brand'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              {tab.icon && (
                <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        className="py-4 animate-fadeIn"
      >
        {activeTabContent?.content}
      </div>
    </div>
  );
}
