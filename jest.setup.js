import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestProvider } from '@/tests/TestProvider';
import { render } from '@testing-library/react';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.customRender = (ui, options) =>
  render(ui, { wrapper: TestProvider, ...options });

//  Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.queryClient = new QueryClient();
global.QueryClientProvider = QueryClientProvider;

global.Response = Response;
global.Request = Request;
global.Headers = Headers;

global.BroadcastChannel = class {
  constructor() {
    this.name = 'mock-broadcast-channel';
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};
