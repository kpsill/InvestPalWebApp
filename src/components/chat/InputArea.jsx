import { useRef, useEffect } from "react";
import { Send, Sparkles, Square } from "lucide-react";
import { Button } from "../ui/Button";
export function InputArea({ value, onChange, onSend, onStop, isLoading, disabled }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-3 pb-4 sm:p-4 sm:pb-8 transition-colors duration-200">
            <div className="max-w-3xl mx-auto relative">
                <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100 dark:border-blue-800 shadow-sm opacity-90 backdrop-blur transition-colors duration-200 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    Ask about stocks, portfolios, or market news
                </div>

                <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm hover:border-gray-300 dark:hover:border-slate-600">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={disabled}
                        placeholder="How is AAPL performing today?"
                        className="flex-1 max-h-[120px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-3 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 text-sm"
                        rows={1}
                    />
                    <Button
                        onClick={isLoading ? onStop : onSend}
                        disabled={(!value.trim() && !isLoading) || disabled}
                        size="icon"
                        className="mb-1 mr-1" // Align bottom right
                    >
                        {isLoading ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3 transition-colors duration-200">
                    AI can make mistakes. Please verify important financial information.
                </p>
            </div>
        </div>
    );
}
