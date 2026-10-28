export type Column<T> = { header: string; render: (row: T) => string | number };

type Props<T> = { columns: Column<T>[]; rows: T[]; caption?: string };

export function DataTable<T>({ columns, rows, caption }: Props<T>) {
  return (
    <table>
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.header} scope="col">
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.header}>{c.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
