'use client';

import React from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import AdUnit from '@/components/common/AdUnit';

interface WorkspaceLayoutProps {
  accentColor: string;
  accentColorDark?: string;
  toolName: string;
  icon?: any;
  error?: string | null;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  preview?: React.ReactNode;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
}

export default function WorkspaceLayout({
  accentColor,
  accentColorDark,
  toolName,
  icon: Icon,
  error,
  actionLabel,
  actionDisabled,
  onAction,
  preview,
  sidebar,
  children,
}: WorkspaceLayoutProps) {
  const gradientEnd = accentColorDark || accentColor;

  if (children) return <>{children}</>;

  return (
    <div className="workspace">
      <div
        className="workspace-preview"
        style={{
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {preview}
        <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
      </div>

      <div className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <h2
            style={{
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: accentColor,
            }}
          >
            {Icon && <Icon size={24} />}
            {toolName}
          </h2>
        </div>

        <div
          className="workspace-sidebar-content"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {sidebar}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
          </div>
        </div>

        <div className="workspace-sidebar-footer">
          {error && (
            <div
              className="text-danger"
              style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}
            >
              {error}
            </div>
          )}
          <button
            className="btn btn-primary btn-xl"
            disabled={actionDisabled}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '1.2rem',
              padding: '1rem',
              marginTop: '0.5rem',
              backgroundColor: accentColor,
              borderColor: accentColor,
              backgroundImage: actionDisabled ? 'none' : `linear-gradient(to right, ${accentColor}, ${gradientEnd})`,
              opacity: actionDisabled ? 0.5 : 1,
              cursor: actionDisabled ? 'not-allowed' : 'pointer',
            }}
            onClick={onAction}
          >
            {actionLabel} <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
