import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/utils/db';
import { withCors } from '@/lib/middleware/cors';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import logger from '@/utils/logger';
import { applySecurityHeaders } from '@/utils/security';

const ALLOWED_CATEGORIES = [
  'ide_plugin',
  'cli',
  'mcp_server',
  'agent_skill',
  'other',
];

async function toolsHandler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    logger.warn(`405 Method Not Allowed - ${req.method}`);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const category = req.query.category as string | undefined;
    const params: string[] = [];
    let where = '';
    if (category) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: 'Invalid category value',
          message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
        });
      }
      params.push(category);
      where = 'WHERE tools.category = $1';
    }

    const result = await pool.query(
      `SELECT
         tools.*,
         COALESCE(AVG(reviews.rating), 0)::float AS avg_rating,
         COUNT(reviews.id)::int AS review_count
       FROM tools
       LEFT JOIN reviews ON reviews.tool_id = tools.id
       ${where}
       GROUP BY tools.id
       ORDER BY tools.name ASC`,
      params,
    );
    logger.info(`GET /api/tools - 200 - ${req.socket.remoteAddress}`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong while retrieving tools.',
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await withCors(withRateLimit(toolsHandler))(req, res);
}
