import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next';

// Helper method to wait for a middleware to execute before continuing
// Using next-connect is another better alternative
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  // Use environment variables for origins
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],
  credentials: true,
});

export function withCors(handler: Function) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      // Run the CORS middleware
      await runMiddleware(req, res, cors);
      // Continue to the handler
      return handler(req, res);
    } catch (error) {
      console.error('CORS middleware error:', error);
      return res.status(500).json({ error: 'CORS check failed' });
    }
  };
}
