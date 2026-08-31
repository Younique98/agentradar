export type ToolCategory =
  | 'ide_plugin'
  | 'cli'
  | 'mcp_server'
  | 'agent_skill'
  | 'other';

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  ide_plugin: 'IDE Plugin',
  cli: 'CLI Tool',
  mcp_server: 'MCP Server',
  agent_skill: 'Agent Skill',
  other: 'Other',
};

type Tool = {
  id: number;
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  homepage_url: string | null;
  avg_rating: number | null;
  review_count: number;
};

export default Tool;
