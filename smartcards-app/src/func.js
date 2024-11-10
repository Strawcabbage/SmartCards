import axios from 'axios';

// Function to handle extracting key terms
export const handleExtractTerms = async (text, setTerms) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Act as a professional tutor. After implying the subject of the text, extract the most important, salient key terms from this text: ${text}` }],
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

// Function to handle creating flashcards from extracted terms
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
// Function to handle file upload to the backend, which will send it to the ChatGPT API
export const handleFileUpload = async (file, setText, setTerms) => {
    if (!file) {
        console.error("No file selected.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Sending the file to the backend for processing by the ChatGPT API
        const response = await axios.post('http://localhost:3001/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data && response.data.parsedContent) {
            // Assuming the response contains the parsed content from ChatGPT
            const parsedContent = response.data.parsedContent;

            // Set the parsed content into the state
            setText(parsedContent);
            handleExtractTerms(parsedContent, setTerms); // Optionally, extract terms from the parsed content
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};
