'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import { getToolBySlug } from '@/config/tools';
import SEO from '@/components/common/SEO';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import FileDropzone from './FileDropzone';
import ToolProgress from './ToolProgress';
import ToolResult from './ToolResult';
import WorkspaceLayout from './WorkspaceLayout';

export type ToolPhase = 'select' | 'workspace' | 'processing' | 'result';

interface ToolLayoutProps {
  slug: string;
  phase: ToolPhase;
  file: File | null;
  isProcessing: boolean;
  progress: number;
  resultUrl: string | null;
  error: string | null;
  onReset: () => void;
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  seoSection?: React.ReactNode;
  customSelectDropzone?: React.ReactNode;
  workspacePreview?: React.ReactNode;
  workspaceSidebar?: React.ReactNode;
  processingLabel: string;
  successMessage: string;
  successSubtitle?: string;
  downloadName?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  children?: React.ReactNode;
  customResult?: React.ReactNode;
}

export default function ToolLayout({
  slug,
  phase,
  file,
  isProcessing,
  progress,
  resultUrl,
  error,
  onReset,
  onDrop,
  accept,
  maxFiles = 1,
  seoSection,
  workspacePreview,
  workspaceSidebar,
  processingLabel,
  successMessage,
  successSubtitle,
  downloadName,
  actionLabel,
  actionDisabled,
  onAction,
  customSelectDropzone,
  customResult,
  children,
}: ToolLayoutProps) {
  const tool = getToolBySlug(slug);
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const ACCENT = tool?.color[0] || '#6345d7';
  const ACCENT_DARK = tool?.color[1] || '#4f46e5';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  if (phase === 'select') {
    return (
      <>
        <SEO slug={slug} />
        <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          {customSelectDropzone || (
            <FileDropzone
              accentColor={ACCENT}
              title={tTools(`${slug}.name`)}
              description={tTools(`${slug}.description`)}
              selectLabel={tCommon('select_file')}
              dropLabel={tCommon('or_drop')}
              onDrop={onDrop}
              accept={accept}
              maxFiles={maxFiles}
            />
          )}
          {seoSection && (
            <div className="container" style={{ padding: '4rem 2rem' }}>
              <AdUnit slot="ad-top" format="horizontal" />
              {seoSection}
              <AdUnit slot="ad-bottom" format="horizontal" />
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  if (phase === 'processing' || phase === 'result') {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <ToolProgress
                progress={progress}
                label={processingLabel}
                accentColor={ACCENT}
                accentColorDark={ACCENT_DARK}
              />
            ) : (
              customResult ? (
                customResult
              ) : resultUrl && (
                <ToolResult
                  accentColor={ACCENT}
                  accentColorDark={ACCENT_DARK}
                  successMessage={successMessage}
                  subtitle={successSubtitle}
                  resultUrl={resultUrl}
                  downloadName={downloadName || `${slug}-result.pdf`}
                  resetLabel={tCommon('process_another') !== 'Common.process_another' ? tCommon('process_another') : actionLabel}
                  onReset={onReset}
                />
              )
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (phase === 'workspace') {
    return (
      <>
        <Header />
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
            <AdUnit slot="ad-workspace-top" format="horizontal" />
          </div>
        </div>
        {children || (
          <WorkspaceLayout
            accentColor={ACCENT}
            accentColorDark={ACCENT_DARK}
            toolName={tTools(`${slug}.name`)}
            icon={tool?.icon}
            error={error}
            actionLabel={actionLabel}
            actionDisabled={actionDisabled}
            onAction={onAction}
            preview={workspacePreview}
            sidebar={workspaceSidebar}
          />
        )}
      </>
    );
  }

  return null;
}
