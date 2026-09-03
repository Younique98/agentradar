import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import pool from '@/utils/db';
import { withCors } from '@/lib/middleware/cors';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { sanitizeInput } from '@/utils/sanitize';
import logger from '@/utils/logger';
import { applySecurityHeaders } from '@/utils/security';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

async function toolHandler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(req, res);

  const slug = req.query.slug as string;

  if (req.method === 'GET') {
    try {
      const toolResult = await pool.query(
        `SELECT
           tools.*,
           COALESCE(AVG(reviews.rating), 0)::float AS avg_rating,
           COUNT(reviews.id)::int AS review_count
         FROM tools
         LEFT JOIN reviews ON reviews.tool_id = tools.id
         WHERE tools.slug = $1
         GROUP BY tools.id`,
        [slug],
      );

      if (toolResult.rows.length === 0) {
        return res.status(404).json({ error: 'Tool not found' });
      }

      const page = parseInt(req.query.page as string) || DEFAULT_PAGE_NUMBER;
      const pageSize =
        parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE;
      const offset = (page - 1) * pageSize;

      const reviewsResult = await pool.query(
        `SELECT * FROM reviews WHERE tool_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3`,
        [toolResult.rows[0].id, pageSize, offset],
      );

      logger.info(`GET /api/tools/${slug} - 200 - ${req.socket.remoteAddress}`);
      return res.status(200).json({
        tool: toolResult.rows[0],
        reviews: reviewsResult.rows,
      });
    } catch (error) {
      console.error(
        `[DB_ERROR]: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong while retrieving the tool.',
      });
    }
  } else if (req.method === 'POST') {
    try {
      // The reviewer's identity comes ONLY from the authenticated session,
      // never from the request body — a client-submitted name is exactly
      // the spoofing hole this endpoint used to have (anyone could type
      // "Anthropic" or a competitor's name and post a review as them).
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.githubId || !session.user.githubLogin) {
        logger.warn(
          `POST /api/tools/${slug} - 401 - Unauthenticated review attempt from ${req.socket.remoteAddress}`,
        );
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Sign in with GitHub to leave a review.',
        });
      }

      const { rating, review } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        logger.warn(
          `POST /api/tools/${slug} - 400 - Invalid rating value from ${req.socket.remoteAddress}`,
        );
        return res.status(400).json({
          error: 'Invalid rating value',
          message: 'Rating must be between 1 and 5.',
        });
      }

      const toolResult = await pool.query(
        'SELECT id FROM tools WHERE slug = $1',
        [slug],
      );
      if (toolResult.rows.length === 0) {
        return res.status(404).json({ error: 'Tool not found' });
      }

      const sanitizedReview = review ? sanitizeInput(review) : null;

      // ON CONFLICT lets someone update their own review by resubmitting,
      // rather than either silently failing or letting the same GitHub
      // account stack up multiple reviews for one tool.
      const result = await pool.query(
        `INSERT INTO reviews (tool_id, rating, review, author_github_id, author_login)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tool_id, author_github_id)
         DO UPDATE SET
           rating = EXCLUDED.rating,
           review = EXCLUDED.review,
           author_login = EXCLUDED.author_login,
           created_at = now()
         RETURNING *`,
        [
          toolResult.rows[0].id,
          rating,
          sanitizedReview || null,
          session.user.githubId,
          session.user.githubLogin,
        ],
      );
      logger.info(
        `POST /api/tools/${slug} - 201 - Review submitted by GitHub user ${session.user.githubLogin} from ${req.socket.remoteAddress}`,
      );
      return res
        .status(201)
        .json({ message: 'Review submitted', review: result.rows[0] });
    } catch (error) {
      logger.error(
        `500 Internal Server Error - ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong while creating the review.',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    logger.warn(`405 Method Not Allowed - ${req.method}`);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await withCors(withRateLimit(toolHandler))(req, res);
}
