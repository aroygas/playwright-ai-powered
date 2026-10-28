import { useQuery } from '@tanstack/react-query';
import { DataTable } from './DataTable';

export type BookingRow = { id: number; firstname: string; lastname: string; totalprice: number };

async function fetchBookings(): Promise<BookingRow[]> {
  const res = await fetch('/api/bookings');
  if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
  return res.json();
}

/** Server-backed component: the network call is what CT specs mock through the `router` fixture. */
export function BookingList() {
  const { data, error, isPending } = useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });

  if (isPending) return <p role="status">Loading bookings…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  if (data.length === 0) return <p>No bookings yet</p>;
  return (
    <DataTable
      caption="Bookings"
      rows={data}
      columns={[
        { header: 'Guest', render: (b) => `${b.firstname} ${b.lastname}` },
        { header: 'Price', render: (b) => b.totalprice },
      ]}
    />
  );
}
