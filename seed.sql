-- Ensure the tables exist
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (
        category IN ('ide_plugin', 'cli', 'mcp_server', 'agent_skill', 'other')
    ),
    description TEXT NOT NULL,
    homepage_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- author_github_id is the authoritative identity: it comes from the
-- caller's authenticated GitHub session (see /api/auth/[...nextauth].ts
-- and /api/tools/[slug].ts), never from client-submitted form input, which
-- is what makes a review here mean something a free-text "author" field
-- couldn't. author_login is a display-only cache of the GitHub username at
-- review time, not itself a source of truth. The UNIQUE constraint means
-- one person has one review per tool — resubmitting updates it rather than
-- stacking duplicate reviews from the same account.
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    tool_id INT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    author_github_id BIGINT NOT NULL,
    author_login VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tool_id, author_github_id)
);

CREATE INDEX IF NOT EXISTS reviews_tool_id_idx ON reviews(tool_id);

-- Seed tools
INSERT INTO tools (slug, name, category, description, homepage_url) VALUES
('claude-code', 'Claude Code', 'cli', 'Anthropic''s agentic coding CLI that reads, edits, and runs code directly in your terminal.', 'https://claude.com/claude-code'),
('github-copilot', 'GitHub Copilot', 'ide_plugin', 'AI pair programmer built into the editor, offering inline code completions and chat.', 'https://github.com/features/copilot'),
('cursor', 'Cursor', 'ide_plugin', 'AI-first code editor with multi-file editing, chat, and agent mode built on top of VS Code.', 'https://cursor.com'),
('cline', 'Cline', 'ide_plugin', 'Open-source autonomous coding agent that runs inside VS Code with terminal and browser access.', 'https://github.com/cline/cline'),
('github-mcp-server', 'GitHub MCP Server', 'mcp_server', 'Official MCP server exposing GitHub repos, issues, and pull requests as tools for AI agents.', 'https://github.com/github/github-mcp-server'),
('playwright-mcp', 'Playwright MCP', 'mcp_server', 'MCP server that lets agents drive a real browser for testing and web automation.', 'https://github.com/microsoft/playwright-mcp'),
('aider', 'Aider', 'cli', 'Terminal-based AI pair programming tool that edits code in your local git repo.', 'https://aider.chat'),
-- Additional CLI agents
('codex-cli', 'Codex CLI', 'cli', 'OpenAI''s terminal-based coding agent, built around sandboxed, approval-gated command execution.', 'https://developers.openai.com/codex/cli/'),
('gemini-cli', 'Gemini CLI', 'cli', 'Google''s open-source terminal AI agent built on Gemini models, with a free tier aimed at individual developers.', 'https://github.com/google-gemini/gemini-cli'),
('opencode', 'OpenCode', 'cli', 'Open-source, provider-agnostic terminal coding agent that can run against Claude, GPT, or other models interchangeably.', 'https://opencode.ai'),
('github-copilot-cli', 'GitHub Copilot CLI', 'cli', 'Terminal version of GitHub Copilot, bringing repo-aware AI assistance to the command line and CI pipelines.', 'https://github.com/features/copilot/cli'),
-- Additional IDE plugins and editor platforms
('jetbrains-ai-assistant', 'JetBrains AI Assistant', 'ide_plugin', 'AI coding assistant built into JetBrains IDEs (IntelliJ, PyCharm, WebStorm), offering inline completion, chat, and refactoring.', 'https://www.jetbrains.com/ai/'),
('tabnine', 'Tabnine', 'ide_plugin', 'AI code completion tool with a particular focus on private, self-hosted deployment for enterprises with strict data requirements.', 'https://www.tabnine.com'),
('amazon-q-developer', 'Amazon Q Developer', 'ide_plugin', 'AWS''s AI coding assistant, integrated into IDEs and the AWS console, with deep awareness of AWS services and infrastructure code.', 'https://aws.amazon.com/q/developer/'),
('continue', 'Continue', 'ide_plugin', 'Open-source AI coding assistant for VS Code and JetBrains that lets you plug in your own model and context providers.', 'https://continue.dev'),
('devin', 'Devin', 'other', 'Cognition''s autonomous coding agent, designed to independently plan and execute multi-step engineering tasks rather than complete inline suggestions.', 'https://cognition.ai'),
('zed', 'Zed', 'other', 'Independent, high-performance code editor with native support for running Claude Code, Codex, and other agents inside its own agent panel.', 'https://zed.dev'),
('replit-agent', 'Replit Agent', 'other', 'Agent built into Replit''s cloud IDE that can scaffold, build, and deploy an app from a natural-language prompt end to end.', 'https://replit.com/ai'),
-- Additional MCP servers
('filesystem-mcp', 'Filesystem MCP', 'mcp_server', 'Reference MCP server exposing local filesystem read/write access as tools — one of the most commonly installed MCP servers.', 'https://github.com/modelcontextprotocol/servers'),
('postgres-mcp', 'Postgres MCP', 'mcp_server', 'MCP server for querying and inspecting a Postgres database directly from an agent''s context.', 'https://github.com/modelcontextprotocol/servers'),
('context7-mcp', 'Context7', 'mcp_server', 'MCP server that fetches up-to-date, version-specific library and framework documentation into an agent''s context, cutting down on outdated-API mistakes.', 'https://context7.com'),
('sentry-mcp', 'Sentry MCP', 'mcp_server', 'MCP server connecting an agent to Sentry, letting it read and triage real production error reports as part of a coding session.', 'https://docs.sentry.io/product/sentry-mcp/'),
('notion-mcp', 'Notion MCP', 'mcp_server', 'MCP server exposing Notion pages and databases as tools, letting an agent read and write project docs directly.', 'https://developers.notion.com/docs/mcp'),
('stripe-mcp', 'Stripe MCP', 'mcp_server', 'Official MCP server for Stripe, letting an agent inspect and act on payments, customers, and subscriptions during development.', 'https://docs.stripe.com/mcp'),
-- Agent Skills (kept to entries with a verifiable, stable homepage — this
-- category is the newest and least standardized, so it's better to list
-- fewer, accurately, than to pad it with unverifiable specifics)
('skill-creator', 'skill-creator', 'agent_skill', 'Anthropic''s own meta-skill for authoring new Claude Agent Skills — scaffolds a SKILL.md and walks through the structure a skill needs.', 'https://github.com/anthropics/skills'),
('code-reviewer-skill', 'code-reviewer', 'agent_skill', 'Community-built Agent Skill that runs a structured review pass against a diff — consistently one of the most-installed skills on Claude Code skill marketplaces.', 'https://www.agensi.io')
ON CONFLICT (slug) DO NOTHING;

-- No seeded reviews. Every review on this platform must come from a real,
-- authenticated submission (see the auth work tracked separately) — a
-- fabricated review attributed to a fake name on a real product (previously
-- seeded here for Claude Code, GitHub Copilot, and Cursor) is a false
-- endorsement risk against real companies, not harmless placeholder content.
-- New tools should launch with zero reviews and an honest "no reviews yet"
-- state rather than manufactured social proof.
