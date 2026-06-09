import React from "react";
import { cn } from "@/lib/utils";
import { ToolResponseUI } from "./ToolResponseUI";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant" | "tool";
  content: string;
  toolsUsed?: string[];
  toolResults?: any[];
  onSendMessage?: (content: string) => void;
}

export function MessageBubble({ role, content, toolsUsed, toolResults, onSendMessage }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full mb-8 group", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex gap-4 w-full max-w-3xl",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm",
          isUser 
            ? "bg-secondary border-border/50 text-secondary-foreground" 
            : "bg-primary/10 border-primary/20 text-primary"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Content Wrapper */}
        <div className={cn(
          "flex flex-col gap-2 min-w-0 flex-1",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Tool Responses (if Assistant) */}
          {!isUser && toolsUsed && toolsUsed.length > 0 && (
            <div className="mb-2 space-y-2 w-full max-w-sm">
              {toolsUsed.map((tool, idx) => (
                <ToolResponseUI 
                  key={idx} 
                  toolName={tool} 
                  toolResult={toolResults ? toolResults[idx] : undefined} 
                  onSendMessage={onSendMessage}
                />
              ))}
            </div>
          )}
          
          {/* Text Content */}
          {content && (
            <div className={cn(
              "whitespace-pre-wrap text-[15px] leading-relaxed tracking-tight",
              isUser ? "text-right" : "text-left text-foreground/90"
            )}>
              {isUser ? (
                content
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                      if (inline) {
                        return (
                          <code className="bg-secondary/50 px-1 py-0.5 rounded text-[13px] font-mono text-primary" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block bg-secondary/30 p-3 rounded-md text-[13px] font-mono overflow-x-auto my-3 border border-border/50 text-foreground/80" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
