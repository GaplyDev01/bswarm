import React from 'react';
import { TradesXBTAvatar } from './TradesXBTAvatar';
import { formatDate, createSafeHtml, sanitizeHtml } from '@/lib/utils';
import { Database, BarChart, LineChart, TrendingUp, Zap } from 'lucide-react';

interface TradesXBTMessageProps {
  content: string;
  timestamp?: Date;
  toolCalls?: unknown[];
}

export const TradesXBTMessage: React.FC<TradesXBTMessageProps> = ({
  content,
  timestamp = new Date(),
  toolCalls = [],
}) => {
  // Function to randomly style parts of the message to look more authentic
  const processMessage = (text: string) => {
    // Split message into paragraphs
    return text.split('\n').map((paragraph, i) => {
      if (!paragraph.trim()) return <br key={`br-${i}`} />;

      // Randomly apply styling to some paragraphs
      const shouldAddCaps = Math.random() > 0.7;
      const shouldAddEmphasis = Math.random() > 0.8;

      let styledParagraph = paragraph;

      // Sometimes make text all caps for emphasis
      if (shouldAddCaps) {
        // Find something to capitalize (look for words with ! or ? or important terms)
        const wordsToCapitalize = ['bullish', 'bearish', 'rug', 'moon', 'pump', 'dump', 'rekt'];

        wordsToCapitalize.forEach(word => {
          if (paragraph.toLowerCase().includes(word)) {
            styledParagraph = styledParagraph.replace(new RegExp(word, 'i'), match =>
              match.toUpperCase()
            );
          }
        });
      }

      // Add emphasis to trading terms
      if (shouldAddEmphasis) {
        const tradingTerms = ['sol', 'eth', 'btc', 'jup', 'bonk', '$'];

        tradingTerms.forEach(term => {
          if (paragraph.toLowerCase().includes(term)) {
            styledParagraph = styledParagraph.replace(
              new RegExp(`\\b${term}\\b`, 'i'),
              match => `<span class="trading-term">${match}</span>`
            );
          }
        });
      }

      return <p key={`p-${i}`} dangerouslySetInnerHTML={createSafeHtml(styledParagraph)} />;
    });
  };

  // Get icon for tool by name
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'get_token_price':
        return <Database className="h-3 w-3 mr-1" />;
      case 'get_token_chart_data':
        return <LineChart className="h-3 w-3 mr-1" />;
      case 'get_market_sentiment':
        return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'get_technical_indicators':
        return <BarChart className="h-3 w-3 mr-1" />;
      case 'get_on_chain_metrics':
        return <LineChart className="h-3 w-3 mr-1" />;
      case 'get_trading_signals':
        return <Zap className="h-3 w-3 mr-1 text-yellow-300" />;
      case 'get_token_ecosystem':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'analyze_portfolio':
        return <BarChart className="h-3 w-3 mr-1 text-blue-300" />;
      default:
        return <Zap className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="flex items-start mb-4">
      <div className="mr-3 flex-shrink-0 mt-1">
        <TradesXBTAvatar size="sm" />
      </div>

      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="trader-handle text-sm font-medium">TradesXBT</span>
          <span className="text-xs text-gray-400 ml-2">{formatDate(timestamp)}</span>

          {/* Show tool badges if tools were used */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="flex ml-2">
              {toolCalls.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center bg-emerald-400/10 text-emerald-300 text-xs px-1.5 py-0.5 rounded-sm ml-1 border border-emerald-400/20"
                  title={`Used ${tool.function?.name || 'tool'}`}
                >
                  {getToolIcon(tool.function?.name)}
                  <span className="text-[10px]">
                    {tool.function?.name?.replace('get_', '')?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="agent-message rounded-lg p-3 trader-style">{processMessage(content)}</div>
      </div>
    </div>
  );
};

export default TradesXBTMessage;
