import { Button } from "../ui/Button";
import { MessageSquare, TrendingUp, BarChart3, Newspaper, ArrowRight } from "lucide-react";

export function ActionSuggestions({ data, onAction }) {
    const { suggestions, title: dataTitle } = data ?? {};

    // Map icon strings to components if needed, or use a generic one
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'trending_up': return <TrendingUp className="w-4 h-4" />;
            case 'chart': return <BarChart3 className="w-4 h-4" />;
            case 'news': return <Newspaper className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {suggestions?.map((suggestion, idx) => (
                <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => onAction && onAction(suggestion.query)}
                    className="bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs h-8"
                >
                    {getIcon(suggestion.icon)}
                    <span className="ml-2">{suggestion.label}</span>
                    <ArrowRight className="w-3 h-3 ml-1 opacity-50" />
                </Button>
            ))}
        </div>
    );
}
