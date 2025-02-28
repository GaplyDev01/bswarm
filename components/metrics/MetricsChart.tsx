// @ts-nocheck
'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface MetricsChartProps {
  data: Record<string, unknown>[];
  type?: 'area' | 'bar';
  height?: number;
  width?: number | string;
  xDataKey?: string;
  yDataKey?: string;
  secondaryDataKey?: string;
  color?: string;
  secondaryColor?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
  gradientId?: string;
  className?: string;
}

export default function MetricsChart({
  data,
  type = 'area',
  height = 300,
  width = '100%',
  xDataKey = 'timestamp',
  yDataKey = 'value',
  secondaryDataKey,
  color = '#3B82F6',
  secondaryColor = '#10B981',
  showGrid = false,
  showTooltip = true,
  showLegend = false,
  tooltipFormatter = value => `$${value.toFixed(2)}`,
  gradientId = 'colorGradient',
  className = '',
}: MetricsChartProps) {
  // TODO: Replace 'any' with a more specific type
// @ts-ignore
  const renderTooltipContent = ({ active, payload, label }: unknown) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A] border border-gray-800 p-2 rounded shadow-lg text-sm">
          <p className="text-gray-400">{new Date(label).toLocaleDateString()}</p>
          <p className="text-white font-medium">
            {payload[0].name}: {tooltipFormatter(payload[0].value)}
          </p>
          {secondaryDataKey && payload[1] && (
            <p className="text-white font-medium">
              {payload[1].name}: {tooltipFormatter(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Date formatter for X-axis
  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (type === 'area') {
    return (
      <div className={`w-full ${className}`}>
        <ResponsiveContainer width={width} height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#202020" />}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {secondaryDataKey && (
                <linearGradient id={`${gradientId}2`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <XAxis
              dataKey={xDataKey}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatXAxis}
              minTickGap={40}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={value => `$${value}`}
              domain={['auto', 'auto']}
            />
            {showTooltip && <Tooltip content={renderTooltipContent} />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#0A0A0A' }}
              name={yDataKey}
            />
            {secondaryDataKey && (
              <Area
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId}2)`}
                activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2, fill: '#0A0A0A' }}
                name={secondaryDataKey}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#202020" />}
          <XAxis
            dataKey={xDataKey}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatXAxis}
            minTickGap={40}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={value => `$${value}`}
            domain={['auto', 'auto']}
          />
          {showTooltip && <Tooltip content={renderTooltipContent} />}
          {showLegend && <Legend />}
          <Bar dataKey={yDataKey} fill={color} radius={[4, 4, 0, 0]} name={yDataKey} />
          {secondaryDataKey && (
            <Bar
              dataKey={secondaryDataKey}
              fill={secondaryColor}
              radius={[4, 4, 0, 0]}
              name={secondaryDataKey}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
