import { ToolCategory, CATEGORY_LABELS } from '@/data/Tool';

// A fixed categorical assignment, not a generated hue - each category
// keeps the same color everywhere it appears. These are decorative dots
// always paired with the mono text label, so WCAG's "not by color alone"
// requirement is met by the label, not the color (dots only need the
// lower 3:1 non-text-UI contrast bar, which all five clear against both
// light and dark surfaces - no need to split by theme).
const CATEGORY_DOT: Record<ToolCategory, string> = {
  cli: '#3d6d8f',
  ide_plugin: '#2f8a72',
  mcp_server: '#7a5cc4',
  agent_skill: '#a67c00',
  other: '#6b7280',
};

export const CategoryBadge = ({ category }: { category: ToolCategory }) => (
  <span className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-0.5">
    <span
      aria-hidden="true"
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: CATEGORY_DOT[category] }}
    />
    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
      {CATEGORY_LABELS[category]}
    </span>
  </span>
);
