import { CurrencyCode } from '../types';

export interface ShareDataPayload {
  title: string;
  text: string;
  calcId: string;
  inputs?: Record<string, any>;
  currency?: CurrencyCode;
}

export interface ShareResult {
  success: boolean;
  method: 'web-share' | 'clipboard' | 'dismissed' | 'failed';
  message: string;
}

/**
 * Generates a direct calculation result link containing the active calculator
 * and all current input parameters.
 */
export function generateCalculationShareUrl(
  calcId: string,
  inputs?: Record<string, any>,
  currency?: CurrencyCode
): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();

  params.set('calc', calcId);
  if (currency) {
    params.set('currency', currency);
  }

  if (inputs) {
    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }

  url.search = params.toString();
  url.hash = 'live-calculator';
  return url.toString();
}

/**
 * Parses calculation parameters from the current URL if available.
 */
export function parseCalculationShareUrl(): {
  calcId?: string;
  currency?: CurrencyCode;
  inputs?: Record<string, any>;
} | null {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const calcId = searchParams.get('calc');

  if (!calcId) return null;

  const currency = searchParams.get('currency') as CurrencyCode | null;
  const inputs: Record<string, any> = {};

  searchParams.forEach((val, key) => {
    if (key === 'calc' || key === 'currency') return;

    if (val === 'true') {
      inputs[key] = true;
    } else if (val === 'false') {
      inputs[key] = false;
    } else if (/^-?\d+(\.\d+)?$/.test(val)) {
      inputs[key] = parseFloat(val);
    } else {
      inputs[key] = val;
    }
  });

  return {
    calcId,
    currency: currency || undefined,
    inputs: Object.keys(inputs).length > 0 ? inputs : undefined,
  };
}

/**
 * Shares calculation results using the Web Share API (navigator.share)
 * with graceful fallback to navigator.clipboard.
 */
export async function shareCalculationResult({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  const sharePayload = {
    title,
    text,
    url,
  };

  // Check if Web Share API is supported
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      // Check canShare if available
      if (typeof navigator.canShare === 'function') {
        const canShare = navigator.canShare(sharePayload);
        if (!canShare) {
          // If the payload format cannot be shared directly, copy to clipboard
          await copyToClipboard(`${text}\n\n${url}`);
          return {
            success: true,
            method: 'clipboard',
            message: 'Link copied to clipboard!',
          };
        }
      }

      await navigator.share(sharePayload);
      return {
        success: true,
        method: 'web-share',
        message: 'Shared successfully!',
      };
    } catch (err: any) {
      // User tapped cancel or dismissed the share sheet
      if (err.name === 'AbortError') {
        return {
          success: false,
          method: 'dismissed',
          message: 'Share dismissed',
        };
      }

      // If Web Share failed for another reason (permission, iframe constraint), fallback to clipboard
      try {
        await copyToClipboard(`${text}\n\n${url}`);
        return {
          success: true,
          method: 'clipboard',
          message: 'Link copied to clipboard!',
        };
      } catch (clipErr) {
        return {
          success: false,
          method: 'failed',
          message: 'Failed to share or copy link',
        };
      }
    }
  }

  // Fallback to Clipboard API for browsers without Web Share API
  try {
    await copyToClipboard(`${text}\n\n${url}`);
    return {
      success: true,
      method: 'clipboard',
      message: 'Link copied to clipboard!',
    };
  } catch (err) {
    return {
      success: false,
      method: 'failed',
      message: 'Could not copy link',
    };
  }
}

/**
 * Helper to copy text to clipboard with legacy fallback
 */
async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Legacy execCommand fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}
