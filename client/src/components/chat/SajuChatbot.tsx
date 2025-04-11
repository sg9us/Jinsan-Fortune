import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, Loader2, Bot } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SajuAnalysis {
  basic: string;
  yearly: string;
  relationships: string;
  advice: string;
}

export function SajuChatbot() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('chatWelcome')
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: t('chatWelcome')
      }
    ]);
  }, [language, t]);

  const analyzeSajuMutation = useMutation({
    mutationFn: async (birthdate: string) => {
      const response = await apiRequest("POST", "/api/saju/analyze", {
        birthdate,
        language
      });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    
    // Send to API for analysis
    analyzeSajuMutation.mutate(inputValue, {
      onSuccess: (data: SajuAnalysis) => {
        // Format the response into a readable message
        const formattedResponse = `
          **${t('basicSaju')}**: ${data.basic}

          **${t('yearlyFortune')}**: ${data.yearly}

          **${t('relationshipFortune')}**: ${data.relationships}

          **${t('sajuAdvice')}**: ${data.advice}
        `;
        
        // Add assistant message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: formattedResponse 
        }]);
      }
    });
    
    // Clear input
    setInputValue('');
  };

  return (
    <Card className="overflow-hidden border border-neutral-200">
      {/* Chat Header */}
      <div className="bg-primary text-white p-3 flex items-center">
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center mr-3">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="font-medium">
            {t("quickSajuChat")}
          </h3>
          <p className="text-xs text-white/70">
            {t("chatSubtitle")}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-72 overflow-y-auto bg-neutral-50">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`chat-bubble ${
              message.role === "user" ? "user-bubble" : "bot-bubble"
            } mb-3 p-3 rounded-lg max-w-[80%] ${
              message.role === "user" 
                ? "bg-primary text-white ml-auto" 
                : "bg-neutral-200 text-neutral-700 mr-auto"
            }`}
          >
            {message.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                {paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
              </p>
            ))}
          </div>
        ))}
        {analyzeSajuMutation.isPending && (
          <div className="chat-bubble bot-bubble flex items-center bg-neutral-200 text-neutral-700 mr-auto p-3 rounded-lg">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span>{language === "ko" ? "분석 중..." : "Analyzing..."}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        <form onSubmit={handleSubmit} className="flex">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 mr-2"
            disabled={analyzeSajuMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={analyzeSajuMutation.isPending}
          >
            {analyzeSajuMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <SendIcon size={18} />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
