import { cn } from "../../lib/utils";
import { User, Bot } from "lucide-react";
import { MarkdownText } from "../widgets/MarkdownText";
import { SecurityCard } from "../widgets/SecurityCard";
import { MetricsGrid } from "../widgets/MetricsGrid";
import { NewsFeed } from "../widgets/NewsFeed";
import { PortfolioHoldings } from "../widgets/PortfolioHoldings";
import { AssetPerformance } from "../widgets/AssetPerformance";
import { ActionSuggestions } from "../widgets/ActionSuggestions";
import { SectorPerformance } from "../widgets/SectorPerformance";
import { Alert } from "../widgets/Alert";
import { EconomicIndicator } from "../widgets/EconomicIndicator";
import { AllocationChart } from "../widgets/AllocationChart";
import { ComparisonTable } from "../widgets/ComparisonTable";
import { FinancialStatement } from "../widgets/FinancialStatement";
import { InvestmentCalculator } from "../widgets/InvestmentCalculator";

import { Insights } from "../widgets/Insights";

const ComponentRenderer = ({ component, onAction }) => {
    switch (component.type) {
        case 'text':
            return <MarkdownText content={component.content} />;
        case 'security_card':
            return <SecurityCard data={component} />;
        case 'metrics_grid':
            return <MetricsGrid data={component} />;
        case 'news_feed':
            return <NewsFeed data={component} />;
        case 'portfolio_holdings':
            return <PortfolioHoldings data={component} />;
        case 'asset_performance':
            return <AssetPerformance data={component} />;
        case 'sector_performance':
            return <SectorPerformance data={component} />;
        case 'alert':
            return <Alert data={component} />;
        case 'economic_indicator':
            return <EconomicIndicator data={component} />;
        case 'allocation_chart':
            return <AllocationChart data={component} />;
        case 'comparison_table':
            return <ComparisonTable data={component} />;
        case 'financial_statement':
            return <FinancialStatement data={component} />;
        case 'investment_calculator':
            return <InvestmentCalculator data={component} />;
        case 'action_suggestions':
            return <ActionSuggestions data={component} onAction={onAction} />;
        case 'insights':
            return <Insights data={component} />;
        default:
            return (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                    Unsupported component type: {component.type}
                </div>
            );
    }
};

export function MessageBubble({ message, isUser, onAction }) {
    // Message is now a list of components or an object with components
    // The API returns { components: [...] }.
    // But for the user message, it's usually just text. We need to normalize.

    const components = message.components || (message.content ? [{ type: 'text', content: message.content }] : []);

    return (
        <div className={cn("flex w-full gap-4 max-w-3xl mx-auto mb-6", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-200">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
            )}

            <div className={cn(
                "flex flex-col gap-3 min-w-[300px] max-w-[85%]",
                isUser ? "items-end" : "items-start"
            )}>
                {components.map((component, idx) => (
                    <div
                        key={component.id || idx}
                        className={cn(
                            "w-full",
                            isUser && component.type === 'text'
                                ? "bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-md"
                                : isUser
                                    ? ""
                                    : component.type === 'text'
                                        ? "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm shadow-sm transition-colors duration-200"
                                        : "shadow-sm", // Widgets naturally have their own cards
                            component.type === 'action_suggestions' ? "bg-transparent shadow-none border-none p-0" : ""
                        )}
                    >
                        <ComponentRenderer component={component} onAction={onAction} />
                    </div>
                ))}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 transition-colors duration-200">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-200">
                    <User className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
}
