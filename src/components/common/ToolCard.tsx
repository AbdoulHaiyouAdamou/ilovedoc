'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getToolBySlug } from '@/config/tools';
import { useTranslations } from 'next-intl';

interface ToolCardProps {
  slug: string;
}

export default function ToolCard({ slug }: ToolCardProps) {
  const tTools = useTranslations('Tools');
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  const [hovered, setHovered] = useState(false);

  const primaryColor = tool.color[0];

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        borderRadius: 18,
        padding: 28,
        cursor: tool.isAvailable ? 'pointer' : 'default',
        transition: 'transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s',
        transform: hovered && tool.isAvailable ? 'translateY(-6px)' : 'none',
        boxShadow: hovered && tool.isAvailable
          ? `0 16px 48px ${primaryColor}22, 0 0 0 2px ${primaryColor}44`
          : '0 2px 12px rgba(0,0,0,0.04)',
        border: `1px solid ${hovered && tool.isAvailable ? primaryColor + '33' : 'var(--color-border)'}`,
        opacity: tool.isAvailable ? 1 : 0.6,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 14,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {hovered && tool.isAvailable && (
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 19,
            background: `linear-gradient(135deg, ${primaryColor}22, transparent 60%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${primaryColor}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .25s, background .25s',
          transform: hovered && tool.isAvailable ? 'scale(1.1)' : 'none',
        }}
      >
        <tool.icon size={26} color={primaryColor} />
      </div>

      <h2
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--color-text)',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {tTools(`${tool.slug}.name`)}
      </h2>

      <p
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          margin: 0,
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {tTools(`${tool.slug}.description`)}
      </p>

      {!tool.isAvailable && (
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(135deg, ${primaryColor}, ${tool.color[1]})`,
            padding: '3px 10px',
            borderRadius: 20,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            zIndex: 2,
          }}
        >
          Bientôt
        </span>
      )}
    </div>
  );

  if (!tool.isAvailable) {
    return content;
  }

  return (
    <Link
      href={`/${tool.slug}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      {content}
    </Link>
  );
}
