import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/order-logic";

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 };

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function ChartBox({ children, height = 260 }: { children: React.ReactElement; height?: number | undefined }) {
  const mounted = useMounted();
  return <div style={{ height }}>{mounted ? <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer> : <div className="size-full animate-pulse rounded-xl bg-muted" />}</div>;
}

const seedNoise = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
};

/**
 * Last 7 days of revenue/orders. Adds a clearly-labelled demo baseline per day so charts
 * aren't empty in a fresh prototype; real collected orders are added on top.
 */
export function weeklySeries(orders: Order[], key: string, baseline = true) {
  const days: { day: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d.getTime() + 86400000);
    const real = orders.filter((o) => o.status === "collected" && new Date(o.placedAt) >= d && new Date(o.placedAt) < next);
    const n = baseline ? seedNoise(key + i) : 0;
    const baseOrders = baseline ? 18 + (n % 25) : 0;
    days.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      orders: baseOrders + real.length,
      revenue: baseOrders * (55 + (n % 30)) + real.reduce((a, o) => a + o.total, 0),
    });
  }
  return days;
}

export function hourlySeries(orders: Order[], key: string) {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const peak = (h: number) => (h >= 12 && h <= 14 ? 3 : h >= 19 && h <= 22 ? 2.5 : h <= 10 ? 1.6 : 1);
  return hours.map((h) => ({
    hour: `${h % 12 || 12}${h < 12 ? "a" : "p"}`,
    orders: Math.round(((seedNoise(key + h) % 6) + 2) * peak(h)) + orders.filter((o) => new Date(o.placedAt).getHours() === h).length,
  }));
}

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <ChartBox>
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue (demo)"]} />
        <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#rev)" />
      </AreaChart>
    </ChartBox>
  );
}

export function BarsChart({ data, x, y, label, color = "var(--chart-2)", height }: { data: Record<string, string | number>[]; x: string; y: string; label: string; color?: string; height?: number | undefined }) {
  return (
    <ChartBox height={height}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={x} tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" interval={0} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: number) => [v, label]} />
        <Bar dataKey={y} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartBox>
  );
}

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)", "var(--destructive)"];

export function StatusPie({ orders }: { orders: Order[] }) {
  const data = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }), {}),
  ).map(([status, value]) => ({ name: STATUS_LABEL[status as Order["status"]], value }));
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ChartBox height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ChartBox>
      <ul className="w-full space-y-1.5 text-sm sm:w-48">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="flex-1">{d.name}</span>
            <b>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
