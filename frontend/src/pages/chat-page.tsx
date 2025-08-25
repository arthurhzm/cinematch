import AppLayout from "@/components/app-layout";
import InputText from "@/components/input-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import useAI from "@/hooks/use-ai";
import { getInitials } from "@/lib/utils";
import type { Message } from "@/utils/types";
import { Bot, Film, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Layout específico para chat que quebra o container do AppLayout
const ChatLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="absolute inset-0 md:relative">
            {children}
        </div>
    );
};

export default function ChatPage() {
    const { sendIndividualMessage } = useAI();
    const { userData } = useAuth();

    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (inputValue.trim() === "" || isLoading) return;

        const newMessage: Message = { text: inputValue, sender: "user" };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const aiResponse = await sendIndividualMessage([...messages, newMessage]);
            setMessages(prev => [...prev, { text: aiResponse, sender: "ai" }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { text: "Desculpe, ocorreu um erro. Tente novamente.", sender: "ai" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md mx-auto p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Bot className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        Assistente CineMatch
                    </h2>
                    <p className="text-muted-foreground">
                        Converse comigo sobre filmes! Posso ajudar você a descobrir novos filmes,
                        discutir suas preferências ou responder perguntas sobre cinema.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <Card
                        className="cinema-card p-3 hover:border-primary/40 transition-all cursor-pointer"
                        onClick={() => setInputValue("Me recomende filmes de ação")}
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-sm">Me recomende filmes de ação</span>
                        </div>
                    </Card>
                    <Card
                        className="cinema-card p-3 hover:border-primary/40 transition-all cursor-pointer"
                        onClick={() => setInputValue(`Qual filme ganhou o Oscar de melhor filme em ${new Date().getFullYear() - 1}?`)}
                    >
                        <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-primary" />
                            <span className="text-sm">Perguntas sobre Oscar</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderMessage = (message: Message, index: number) => (
        <div
            key={index}
            className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
        >
            {message.sender === "ai" && (
                <Avatar className="w-7 h-7 border border-primary/30 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary">
                        <Bot className="w-3 h-3" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] ${message.sender === "user" ? "order-first" : ""}`}>
                <Card className={`
                    ${message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "cinema-card"
                    }
                `}>
                    <CardContent className="px-3 py-0.5">
                        {message.sender === "ai" ? (
                            <div
                                className="text-sm leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:ml-4 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>a]:transition-colors"
                                dangerouslySetInnerHTML={{ __html: message.text }}
                            />
                        ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.text}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <div className={`text-xs text-muted-foreground mt-1 px-1 ${message.sender === "user" ? "text-right" : "text-left"
                    }`}>
                    {message.sender === "user" ? "Você" : "CineMatch AI"}
                </div>
            </div>

            {message.sender === "user" && (
                <Avatar className="w-7 h-7 border-2 border-primary/30">
                    <AvatarImage src={userData?.profilePicture || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-md font-semibold">
                        {userData ? getInitials(userData?.username) : <User />}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );

    const renderTypingIndicator = () => (
        <div className="flex gap-2 justify-start mb-4">
            <Avatar className="w-7 h-7 border border-primary/30 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary">
                    <Bot className="w-3 h-3" />
                </AvatarFallback>
            </Avatar>
            <Card className="cinema-card">
                <CardContent className="px-3 py-2">
                    <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">Digitando...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <AppLayout>
            <ChatLayout>
                <div className="flex flex-col h-screen">
                    {/* Área de mensagens - ocupa o espaço disponível */}
                    <div className="flex-1 overflow-hidden pt-16 pb-24">
                        {messages.length === 0 ? (
                            renderWelcomeScreen()
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-4 pb-6">
                                    {messages.map((message, index) => renderMessage(message, index))}
                                    {isLoading && renderTypingIndicator()}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Input fixo - fica acima da navbar */}
                    <div className="fixed bottom-15 md:bottom-0 left-0 md:left-63.5 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                        <div className="flex w-full items-end gap-2 max-w-screen-xl mx-auto">
                            <div className="flex-1">
                                <InputText
                                    className="rounded-lg resize-none min-h-[40px] max-h-32"
                                    label=""
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.currentTarget.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Digite sua mensagem sobre filmes..."
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                size="icon"
                                className="h-[40px] w-[40px] shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </ChatLayout>
        </AppLayout>
    );
}