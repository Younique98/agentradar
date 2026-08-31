import { ToolCategory, CATEGORY_LABELS } from '@/data/Tool';
import clsx from 'clsx';

const CATEGORY_STYLES: Record<ToolCategory, string> = {
  ide_plugin: 'bg-blue-100 text-blue-700',
  cli: 'bg-purple-100 text-purple-700',
  mcp_server: 'bg-emerald-100 text-emerald-700',
  agent_skill: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

export const CategoryBadge = ({ category }: { category: ToolCategory }) => (
  <span
    className={clsx(
      'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
      CATEGORY_STYLES[category],
    )}
  >
    {CATEGORY_LABELS[category]}
  </span>
);
