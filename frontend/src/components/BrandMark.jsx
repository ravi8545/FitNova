import { Zap } from 'lucide-react';

/**
 * The one FitNova logo mark. Used by the sidebar, auth pages and footers so the
 * brand looks identical everywhere. Styling lives in styles/index.css (.fn-brand-mark).
 */
export default function BrandMark({ size = 32, className = '' }) {
  return (
    <span
      className={`fn-brand-mark ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Zap size={Math.round(size * 0.58)} strokeWidth={2.2} />
    </span>
  );
}
