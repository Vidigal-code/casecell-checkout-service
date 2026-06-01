const FALLBACK_BASE = 'https://images.placeholders.dev/?width=480&height=480';

export function getProductFallbackImage(productName: string): string {
  const text = encodeURIComponent(productName || 'CaseCell');
  return `${FALLBACK_BASE}&text=${text}&fontSize=36&color=%230C1B33&background=%23F5F2EE`;
}
