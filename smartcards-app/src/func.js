import axios from "axios";

export const handleExtractTerms = async (text, setTerms) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Extract key terms from this text: ${text}` }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const extractedTerms = response.data.choices[0].message.content.split(", ");
        setTerms(extractedTerms);
    } catch (error) {
        console.error("Error extracting terms:", error);
    }
};

export const handleCreateFlashcards = async (terms, setFlashcards, setView) => {
    try {
        const prompt = `Create concise definitions for these terms: ${terms.join(", ")}`;
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const flashcards = response.data.choices[0].message.content
            .split("\n")
            .map(card => {
                const [term, ...definitionParts] = card.split(": ");
                const definition = definitionParts.join(": ").trim();
                return { term: term.trim(), definition };
            })
            .filter(card => card.term && card.definition); // Filter out any blank entries

        setFlashcards(flashcards);
        setView("flashcards");
    } catch (error) {
        console.error("Error creating flashcards:", error);
    }
};

export const handleNext = (currentIndex, setCurrentCardIndex, flashcards, setIsFlipped) => {
    setIsFlipped(false); // Flip to the front (key term)
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);

};

export const handlePrevious = (currentIndex, setCurrentCardIndex, flashcards) => {
    setCurrentCardIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
};

export const handleFlip = (isFlipped, setIsFlipped) => {
    setIsFlipped(!isFlipped);
};