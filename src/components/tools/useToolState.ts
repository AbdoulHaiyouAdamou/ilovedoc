'use client';

import { useState, useCallback } from 'react';
import type { ToolPhase } from '@/components/tools/ToolLayout';

interface UseToolStateOptions {
  onProcess?: () => Promise<void>;
}

export function useToolState(_options?: UseToolStateOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phase: ToolPhase = !file
    ? 'select'
    : isProcessing
      ? 'processing'
      : resultUrl
        ? 'result'
        : 'workspace';

  const onDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setIsProcessing(false);
    setProgress(0);
    setResultUrl(null);
    setError(null);
  }, [resultUrl]);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
  }, []);

  const finishProcessing = useCallback(
    (url: string) => {
      setProgress(100);
      setResultUrl(url);
      setIsProcessing(false);
    },
    []
  );

  const failProcessing = useCallback((err: string) => {
    setError(err);
    setIsProcessing(false);
  }, []);

  return {
    file,
    setFile,
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    resultUrl,
    setResultUrl,
    error,
    setError,
    phase,
    onDrop,
    reset,
    startProcessing,
    finishProcessing,
    failProcessing,
  };
}
