
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, isLoading]);

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
                throw new Error(data.message || "Something went wrong.");
            }

            const botMessage = {
                id: Date.now() + 1,
                text: data.reply,
                sender: "bot"
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                botMessage
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

            {!isOpen && (
                <button
                    className="ai-chatbot-toggle"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI chatbot"
                >
                    💬
                </button>
            )}

            {isOpen && (
                <div className="ai-chatbot-window">

                    <div className="ai-chatbot-header">
                        <div>
                            <h3>FarmLink Assistant</h3>
                            <p>Your smart farming marketplace assistant</p>
                        </div>

                        <button
                            className="ai-chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                        >
                            ×
                        </button>
                    </div>

                    <div className="ai-chatbot-messages">

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`ai-chatbot-message ${
                                    message.sender === "user"
                                        ? "user-message"
                                        : "bot-message"
                                }`}
                            >
                                <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-chatbot-message bot-message">
                                FarmLink Assistant is typing...
                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    <form
                        className="ai-chatbot-input-area"
                        onSubmit={handleSendMessage}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me something..."
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>

                </div>
            )}

        </div>
    );
}

export default AIChatbot;
