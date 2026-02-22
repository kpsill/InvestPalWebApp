import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

export function AssetPerformance({ data }) {
    const { symbol, name, current_price, performance_data, last_updated } = data ?? {};

    // Sort by period logical order if possible, or trust API order.
    // Standard order: 1D, 1W, 1M, YTD, 1Y, 5Y
    const periodOrder = { '1D': 1, '1W': 2, '1M': 3, 'YTD': 4, '1Y': 5, '3Y': 6, '5Y': 7, '10Y': 8 };

    const chartData = performance_data?.map(item => ({
        ...item,
        order: periodOrder[item.period] || 99
    })).sort((a, b) => a.order - b.order) || [];

    const isPositive = (val) => val >= 0;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {name} <span className="text-gray-400 font-normal text-sm">({symbol})</span>
                        </CardTitle>
                        <div className="text-2xl font-bold mt-1">
                            ${current_price?.toLocaleString()}
                        </div>
                    </div>
                    {last_updated && (
                        <div className="flex items-center text-xs text-gray-400 gap-1 bg-gray-50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(last_updated).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="period"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(val) => `${val}%`}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, 'Return']}
                        />
                        <ReferenceLine y={0} stroke="#e5e7eb" />
                        <Bar dataKey="performance" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={isPositive(entry.performance) ? '#16a34a' : '#dc2626'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}


