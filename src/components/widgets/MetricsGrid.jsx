import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { safeFormatDate } from "../../lib/utils";

export function MetricsGrid({ data }) {
    const { metrics, columns = 3 } = data ?? {};

    const formatValue = (value, format) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'string') return value;
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            case 'percentage':
                return `${typeof value === 'number' ? value.toFixed(2) : value}%`;
            case 'ratio':
                return typeof value === 'number' ? value.toFixed(2) : value;
            case 'date':
                return safeFormatDate(value);
            case 'number':
            default:
                return typeof value === 'number' ? value.toLocaleString() : value;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3 border-b border-gray-100/50">
                <CardTitle className="text-base font-semibold text-gray-700 uppercase tracking-wide">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {metrics?.map((metric, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <p className="text-xs text-gray-500 font-medium mb-1">{metric.label}</p>
                            <p className="font-semibold text-gray-900 tracking-tight">
                                {formatValue(metric.value, metric.format)}
                                {metric.change !== undefined && (
                                    <span className={`ml-2 text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.change > 0 ? '+' : ''}{metric.change}%
                                    </span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
