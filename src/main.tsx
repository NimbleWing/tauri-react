import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './locales';
import './extensions/Number';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 2 * 60 * 1000, refetchOnMount: 'always' },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
