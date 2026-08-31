import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const sanitizeInput = (input: string) => {
  return purify.sanitize(input);
};
