import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Lightbulb, Info } from "lucide-react";

export function Insights({ data }) {
    const { headline, insights, context } = data ?? {};

    return (
        <Card className="w-full bg-indigo-50/50 border-indigo-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 border-b border-indigo-100/30">
                <CardTitle className="text-indigo-900 flex items-center gap-2 text-base">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                    {headline ?? 'Insights'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <ul className="space-y-3">
                    {insights?.map((insight, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-indigo-800 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                            {insight}
                        </li>
                    ))}
                </ul>
                {context && (
                    <div className="mt-4 pt-4 border-t border-indigo-100/50 flex gap-2 items-start opacity-80">
                        <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                        <p className="text-[11px] italic text-indigo-700 leading-tight">
                            {context}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
