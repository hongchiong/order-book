import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import OrderBook from './component/OrderBook';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrderBook />
    </QueryClientProvider>
  );
}

export default App;
