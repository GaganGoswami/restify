"use client";

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const headerEntries = Object.entries(headers);

  if (headerEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No response headers
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left text-sm font-semibold">Header</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {headerEntries.map(([key, value]) => (
              <tr key={key} className="border-b last:border-0">
                <td className="px-4 py-2 text-sm font-medium">{key}</td>
                <td className="px-4 py-2 text-sm font-mono text-muted-foreground break-all">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
