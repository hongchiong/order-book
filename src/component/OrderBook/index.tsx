import React from 'react';
import classNames from 'classnames';
import { useQuery } from 'react-query';

const ORDER_TYPES = {
  ASKS: 'asks',
  BIDS: 'bids',
};

const getOrders = async () => {
  const response = await fetch(
    'https://dex-mainnet-webserver-ecs.zeta.markets/orderbooks/SOL?marketIndexes%5B%5D=137'
  );

  const data = await response.json();
  return data?.orderbooks[0];
};

interface Props {
  type: string;
  data: {
    price: number;
    size: number;
  }[];
}

const Orders = ({ type, data }: Props) => {
  const highestOrderValue = data
    .map((order) => order.price * order.size)
    .sort((a, b) => b - a)[0];

  return (
    <div
      className={classNames('flex flex-col max-h-56 overflow-y-auto', {
        'flex-col-reverse': type === ORDER_TYPES.ASKS,
        'text-red-400': type === ORDER_TYPES.ASKS,
        'text-green-400': type === ORDER_TYPES.BIDS,
      })}>
      {data.map((order) => {
        return (
          <div className='grid grid-cols-10 p-2 relative' key={order.price}>
            <p className='col-span-4'>{order.price}</p>
            <p className='col-span-3 text-white'>{order.size}</p>
            <p className='col-span-3 text-white'>
              {(order.price * order.size).toFixed(2)}
            </p>
            <div
              className={classNames('absolute h-full opacity-25', {
                'bg-red-300': type === ORDER_TYPES.ASKS,
                'bg-green-300': type === ORDER_TYPES.BIDS,
              })}
              style={{
                width:
                  (order.price * order.size * 99) / highestOrderValue + 1 + '%',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const OrderBook = () => {
  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    initialData: { bids: [], asks: [] },
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const priceDiff = data?.asks[0]?.price - data?.bids[0]?.price;
  const percentageDiff = () =>
    ((Math.abs(priceDiff) / data?.bids[0]?.price) * 100).toFixed(3) + '%';

  return (
    <div className='flex flex-col py-4 border border-slate-500 rounded bg-gray-700 m-4 text-white text-xs'>
      <div className='grid grid-cols-10 border-b pb-4 border-slate-500 px-2 text-sm font-semibold'>
        <p className='col-span-4'>PRICE ($)</p>
        <p className='col-span-3'>SIZE (SOL)</p>
        <p className='col-span-3'>TOTAL (USD)</p>
      </div>
      <div className='pt-4'>
        <Orders type={ORDER_TYPES.ASKS} data={data?.asks} />
        <div className='grid grid-cols-10 p-2 bg-gray-600 text-sm font-semibold'>
          <p className='col-span-4'>SPREAD</p>
          <p className='col-span-3'>{priceDiff.toFixed(3)}</p>
          <p className='col-span-3'>{percentageDiff()}</p>
        </div>
        <Orders type={ORDER_TYPES.BIDS} data={data?.bids} />
      </div>
    </div>
  );
};

export default OrderBook;
