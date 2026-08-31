import { sanitizeInput } from '@/utils/sanitize';

test('Sanitizes user input correctly', () => {
  const dirtyInput = '<script>alert("XSS")</script> Hello!';
  const cleanInput = sanitizeInput(dirtyInput);

  expect(cleanInput).not.toContain('<script>');
  expect(cleanInput).toBe('Hello!');
});
