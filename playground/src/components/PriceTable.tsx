import { DataTable } from './DataTable';

const rows = [
  { name: 'Backpack', price: 29.99 },
  { name: 'Bike light', price: 9.99 },
];

/** Static data + render functions live inside the component: CT props cross a process boundary, so functions can't be passed to mount(). */
export function PriceTable() {
  return (
    <DataTable
      caption="Prices"
      rows={rows}
      columns={[
        { header: 'Item', render: (r) => r.name },
        { header: 'Price', render: (r) => r.price },
      ]}
    />
  );
}
