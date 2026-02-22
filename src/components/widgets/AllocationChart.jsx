import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AllocationChart({ data }) {
    const { allocations = [], allocation_type, chart_type, total_value } = data;
    const title = (data.title != null && data.title !== '') ? data.title : (allocation_type ? `${allocation_type.replace('_', ' ')} Allocation` : 'Allocation');

    // Custom colors or map from data if provided
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

    const innerRadius = chart_type === 'donut' ? 60 : 0;
    const total = Array.isArray(allocations) && allocations.length > 0 ? allocations.reduce((a, b) => a + (b?.value ?? 0), 0) : 0;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="capitalize flex justify-between items-center">
                    <span>{title}</span>
                    {total_value != null && total_value !== '' && (
                        <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                            ${Number(total_value).toLocaleString()}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={allocations}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="label"
                        >
                            {allocations?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry?.color || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => {
                                const pct = props?.payload?.percentage ?? (total > 0 && typeof value === 'number' ? ((value / total) * 100).toFixed(1) : '0');
                                return [`${pct}% ($${typeof value === 'number' ? value.toLocaleString() : value})`, name];
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
