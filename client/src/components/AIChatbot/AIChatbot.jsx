
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AIChatbot.css";

function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! 👋 Welcome to FarmLink. How can I help you today?",
            sender: "bot"
        }
    ]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, [messages, isLoading, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const trimmedMessage = input.trim();

        if (!trimmedMessage || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: trimmedMessage,
            sender: "user"
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage
        ]);

        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: trimmedMessage
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Something went wrong."
                );
            }

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: Date.now() + 1,
                    text: data.reply,
                    sender: "bot"
                }
            ]);

        } catch (error) {
            console.error("Chatbot error:", error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: Date.now() + 1,
                    text: "Sorry, I'm having trouble connecting right now. Please try again.",
                    sender: "bot"
                }
            ]);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-chatbot-container">

            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    className="ai-chatbot-toggle"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open FarmLink Assistant"
                >
                    <span className="chat-icon">💬</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="ai-chatbot-window"
                    role="dialog"
                    aria-label="FarmLink Assistant"
                >

                    {/* Header */}
                    <div className="ai-chatbot-header">

                        <div className="ai-chatbot-brand">
                            <div className="ai-chatbot-avatar">
                                🌱
                            </div>

                            <div>
                                <h3>FarmLink Assistant</h3>
                                <p>
                                    <span className="online-indicator"></span>
                                    Your smart farming marketplace assistant
                                </p>
                            </div>
                        </div>

                        <button
                            className="ai-chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                        >
                            ×
                        </button>

                    </div>

                    {/* Messages */}
                    <div
                        className="ai-chatbot-messages"
                        aria-live="polite"
                    >

                        <div className="chat-date-label">
                            FarmLink Assistant
                        </div>

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`ai-chatbot-message-row ${
                                    message.sender === "user"
                                        ? "user-row"
                                        : "bot-row"
                                }`}
                            >
                                {message.sender === "bot" && (
                                    <div className="message-avatar">
                                        🌱
                                    </div>
                                )}

                                <div
                                    className={`ai-chatbot-message ${
                                        message.sender === "user"
                                            ? "user-message"
                                            : "bot-message"
                                    }`}
                                >
                                    {message.sender === "bot" ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ children }) => (
                                                    <div className="ai-chatbot-table-wrapper">
                                                        <table>
                                                            {children}
                                                        </table>
                                                    </div>
                                                )
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    ) : (
                                        message.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Animated Typing Indicator */}
                        {isLoading && (
                            <div className="ai-chatbot-message-row bot-row">

                                <div className="message-avatar">
                                    🌱
                                </div>

                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* Input */}
                    <form
                        className="ai-chatbot-input-area"
                        onSubmit={handleSendMessage}
                    >

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about products, prices..."
                            disabled={isLoading}
                            maxLength={1000}
                            aria-label="Type your message"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                        >
                            <span>Send</span>
                            <span className="send-icon">➤</span>
                        </button>

                    </form>

                    <div className="chatbot-footer">
                        Powered by FarmLink AI
                    </div>

                </div>
            )}

        </div>
    );
}

export default AIChatbot;
