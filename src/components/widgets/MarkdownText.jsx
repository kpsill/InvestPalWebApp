import { cn } from "../../lib/utils";

export function MarkdownText({ content, className }) {
    // Simple rendering for now. In a real app with 'markdown' format specified, 
    // we would use a library like react-markdown. 
    // For now, we handle newlines and basic styling.

    if (content == null) return null;

    return (
        <div className={cn("prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap", className)}>
            {content}
        </div>
    );
}
