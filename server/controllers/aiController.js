
import Groq from "groq-sdk";
import { getFilteredAIProducts } from "../services/aiProductService.js";
import { extractProductFilters } from "../services/aiFilterService.js";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                message: "Please enter a valid message"
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                message: "Message cannot exceed 1000 characters"
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                message: "Groq API is not configured"
            });
        }

        const filters = await extractProductFilters(message.trim());

        const productContext = await getFilteredAIProducts(filters);

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: `You are FarmLink Assistant, an AI assistant for an agricultural marketplace in Sri Lanka.

                    Help users with farming, agricultural products, buying and selling.

                    Be friendly, professional and concise.

                    LIVE FARMLINK MARKETPLACE DATA:
                    ${JSON.stringify(productContext, null, 2)}

                    IMPORTANT RULES:
                    1. Use the supplied marketplace data when answering questions about FarmLink products.
                    2. Never invent product names, prices, quantities, sellers or availability.
                    3. Only recommend products included in the supplied data.
                    4. Product prices are in Sri Lankan Rupees (LKR).
                    5. Always mention the unit when discussing a product price.
                    6. If a requested product is not in the supplied data, explain that no matching available listing was found.
                    7. If the product list is empty, explain that there are currently no available approved listings.
                    8. Do not reveal private user information, orders, credentials or internal database details.
                    9. For general farming questions, provide helpful answers using your agricultural knowledge.
                    10. Keep answers clear and reasonably short.`
                },
                {
                    role: "user",
                    content: message.trim()
                }
            ],
            temperature: 0.7,
            max_completion_tokens: 1024
        });

        const reply = completion.choices[0]?.message?.content;

        return res.status(200).json({
            message: "AI response generated successfully",
            reply: reply || "Sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error("Groq chatbot error:", error);

        return res.status(500).json({
            message: "Unable to generate AI response"
        });
    }
};

export { chatWithAI };
