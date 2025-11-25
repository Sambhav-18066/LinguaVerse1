'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', fluency: 80, richness: 5.5 },
  { month: 'February', fluency: 82, richness: 5.7 },
  { month: 'March', fluency: 85, richness: 5.9 },
  { month: 'April', fluency: 87, richness: 6.3 },
  { month: 'May', fluency: 90, richness: 6.5 },
  { month: 'June', fluency: 88, richness: 6.4 },
];

const chartConfig = {
  fluency: {
    label: 'Fluency (WPM)',
    color: 'hsl(var(--chart-1))',
  },
  richness: {
    label: 'Lexical Richness',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="fluency" fill="var(--color-fluency)" radius={4} />
          <Bar dataKey="richness" fill="var(--color-richness)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
