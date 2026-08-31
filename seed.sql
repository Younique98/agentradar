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

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    tool_id INT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
('aider', 'Aider', 'cli', 'Terminal-based AI pair programming tool that edits code in your local git repo.', 'https://aider.chat')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (tool_id, rating, review, author)
SELECT id, 5, 'Handles multi-file refactors better than anything else I''ve tried.', 'Demo User'
FROM tools WHERE slug = 'claude-code'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (tool_id, rating, review, author)
SELECT id, 4, 'Great for quick completions, less reliable on larger architectural changes.', 'A. Developer'
FROM tools WHERE slug = 'github-copilot'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (tool_id, rating, review, author)
SELECT id, 5, 'The agent mode saved us a full day on a gnarly migration.', 'Demo User'
FROM tools WHERE slug = 'cursor'
ON CONFLICT DO NOTHING;
