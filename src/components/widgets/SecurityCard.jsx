import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { TrendingUp, TrendingDown, Briefcase } from "lucide-react";

export function SecurityCard({ data }) {
    const { symbol, name, price, market_cap, asset_type, sector, change_percent, description, industry } = data ?? {};

    const isPositive = (change_percent || 0) >= 0;

    return (
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {symbol}
                            <Badge variant="outline" className="text-[10px] uppercase">{asset_type || 'Stock'}</Badge>
                        </CardTitle>
                        <CardDescription className="font-medium mt-1">{name}</CardDescription>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {description && (
                    <p className="text-xs text-gray-500 mb-4 italic">
                        {description}
                    </p>
                )}
                <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-bold tracking-tight">
                        ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {change_percent !== undefined && (
                        <Badge variant={isPositive ? "success" : "danger"} className="flex gap-1 items-center px-2 py-1">
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change_percent)}%
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Market Cap</p>
                        <p className="font-medium">{market_cap ? `$${market_cap?.toLocaleString()}` : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sector / Industry</p>
                        <p className="font-medium text-xs">
                            {sector || industry ? `${sector || ''}${sector && industry ? ' • ' : ''}${industry || ''}` : 'N/A'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
