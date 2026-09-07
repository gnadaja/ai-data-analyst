"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ColumnMetric = {
  name: string;
  missing_count: number;
};

export function MissingValuesChart({ data }: { data: ColumnMetric[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((column) => ({
    ...column,
    label: column.name.length > 18 ? `${column.name.slice(0, 18)}...` : column.name,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--text-soft)", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "var(--primary-soft)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }} />
          <Bar dataKey="missing_count" name="Valores faltantes" fill="var(--primary)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
