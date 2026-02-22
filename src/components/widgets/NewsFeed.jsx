import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { ExternalLink, Calendar, Newspaper } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "../../lib/utils";

export function NewsFeed({ data }) {
    const { articles, title: dataTitle } = data ?? {};

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-purple-600" />
                    {dataTitle ?? 'Market News'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">
                <div className="divide-y divide-gray-100">
                    {articles?.map((article, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-2">{article.summary}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                            {article.source}
                                        </span>
                                        {article.sentiment && (
                                            <span className={cn(
                                                "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                                                article.sentiment === 'positive' ? "text-green-600 bg-green-50" :
                                                    article.sentiment === 'negative' ? "text-red-600 bg-red-50" :
                                                        "text-gray-600 bg-gray-50"
                                            )}>
                                                {article.sentiment}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {article.published_at ? format(new Date(article.published_at), 'MMM d, h:mm a') : 'Just now'}
                                        </span>
                                    </div>
                                </div>
                                {article.image_url && (
                                    <img
                                        src={article.image_url}
                                        alt=""
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                                    />
                                )}
                            </div>
                            {article.url && (
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 z-10"
                                    aria-label={`Read full article: ${article.title}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
