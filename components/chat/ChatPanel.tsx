"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { MessageBubble } from "./MessageBubble";
import { CommandBar } from "./CommandBar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ChatPanel() {
  const { user } = useUser();
  const [optimisticMessage, setOptimisticMessage] = useState<{ role: "user"; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // We fetch user ID via query or we assume user is authenticated and DB is synced.
  // Actually, we need internal userId for messages query. We can use clerkId to get userId first.
  const dbUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  
  const messages = useQuery(api.messages.getMessages, dbUser ? { userId: dbUser._id } : "skip");
  const processChat = useAction(api.actions.chat.processChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessage, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!dbUser) return;
    
    setIsLoading(true);
    setOptimisticMessage({ role: "user", content });
    
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await processChat({ 
        message: content,
        deviceTimezone: timezone,
        clerkId: user?.id,
      });
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setOptimisticMessage(null);
      setIsLoading(false);
    }
  };

  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // If user is loaded but not in DB, sync them immediately
    if (user?.id && dbUser === null) {
      syncUser({
        clerkId: user.id,
        name: user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
      }).catch(console.error);
    }
  }, [user, dbUser, syncUser]);

  if (dbUser === undefined || dbUser === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Setting up your workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          {messages?.length === 0 && !optimisticMessage && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-60">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 text-2xl">
                ✨
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to FlowAi</h2>
              <p className="max-w-md text-muted-foreground">
                I can help you track your expenses, manage your schedule, and check if you can afford things. 
                Just ask me naturally!
              </p>
            </div>
          )}

          {messages?.map((msg) => (
            <MessageBubble 
              key={msg._id}
              role={msg.role}
              content={msg.content}
              toolsUsed={msg.toolsUsed}
              toolResults={(msg as any).toolResults}
            />
          ))}

          {optimisticMessage && (
            <MessageBubble role={optimisticMessage.role} content={optimisticMessage.content} />
          )}

          {isLoading && (
            <div className="flex justify-start mb-6 w-full">
              <div className="bg-muted rounded-2xl rounded-bl-none px-5 py-3 text-sm text-muted-foreground flex gap-1 items-center">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-6">
        <CommandBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
