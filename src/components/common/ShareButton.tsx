import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { CurrencyCode } from '../../types';
import {
  generateCalculationShareUrl,
  shareCalculationResult,
  ShareResult,
} from '../../utils/share';
import { useLanguage } from '../../context/LanguageContext';

export interface ShareButtonProps {
  title: string;
  text: string;
  calcId: string;
  inputs?: Record<string, any>;
  currency?: CurrencyCode;
  customUrl?: string;
  variant?: 'glazed-header' | 'primary' | 'card' | 'compact' | 'light';
  className?: string;
  buttonLabel?: string;
  onShareComplete?: (result: ShareResult) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  calcId,
  inputs,
  currency,
  customUrl,
  variant = 'glazed-header',
  className = '',
  buttonLabel,
  onShareComplete,
}) => {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const shareUrl =
      customUrl || generateCalculationShareUrl(calcId, inputs, currency);

    const result = await shareCalculationResult({
      title,
      text,
      url: shareUrl,
    });

    if (result.success) {
      if (result.method === 'web-share') {
        setStatus('shared');
        setToastMessage(t('shared') || 'Shared successfully!');
      } else {
        setStatus('copied');
        setToastMessage(t('share_link_copied') || 'Calculation link copied to clipboard!');
      }

      setTimeout(() => {
        setStatus('idle');
        setToastMessage(null);
      }, 2500);
    } else if (result.method === 'failed') {
      setStatus('idle');
      setToastMessage('Could not share link');
      setTimeout(() => setToastMessage(null), 2500);
    }

    if (onShareComplete) {
      onShareComplete(result);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (status === 'shared') {
      return t('shared') || 'Shared!';
    }
    if (status === 'copied') {
      return t('share_link_copied') || 'Link Copied!';
    }
    return buttonLabel || t('share') || 'Share';
  };

  // Determine styling class according to variant
  let variantClass = '';
  switch (variant) {
    case 'glazed-header':
      variantClass =
        status !== 'idle'
          ? 'btn-gloss btn-gloss-emerald text-emerald-100'
          : 'btn-gloss btn-gloss-blue text-white hover:text-blue-100';
      break;
    case 'primary':
      variantClass =
        status !== 'idle'
          ? 'btn-gloss btn-gloss-emerald text-white shadow-xs'
          : 'btn-gloss btn-gloss-indigo text-white shadow-xs';
      break;
    case 'card':
      variantClass =
        status !== 'idle'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200';
      break;
    case 'light':
      variantClass =
        status !== 'idle'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:text-indigo-600';
      break;
    case 'compact':
      variantClass =
        status !== 'idle'
          ? 'bg-emerald-600 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white';
      break;
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        className={`transition-all duration-200 inline-flex items-center gap-1.5 font-bold cursor-pointer select-none ${
          variant === 'compact'
            ? 'p-1.5 rounded-lg text-xs'
            : 'text-[11px] px-3 py-1.5 rounded-lg shadow-2xs'
        } ${variantClass} ${className}`}
        title="Web Share: Share calculation result link directly or copy to clipboard"
        aria-label="Share calculation link"
      >
        {status !== 'idle' ? (
          <Check className="w-3.5 h-3.5 animate-bounce shrink-0" />
        ) : (
          <Share2 className="w-3.5 h-3.5 shrink-0" />
        )}
        {variant !== 'compact' && <span>{getButtonText()}</span>}
      </button>

      {/* Floating Toast Feedback */}
      {toastMessage && (
        <div className="absolute -bottom-9 right-0 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-700 pointer-events-none animate-fade-in flex items-center gap-1.5">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
