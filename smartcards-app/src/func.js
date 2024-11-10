import axios from 'axios';

// Extract terms function
export const handleExtractTerms = async (text, setTerms) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Extract key terms from the following text: ${text}` }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const extractedTerms = response.data.choices[0].message.content.split(", ");
        setTerms(Array.isArray(extractedTerms) ? extractedTerms : []);
    } catch (error) {
        console.error("Error extracting terms:", error);
    }
};

// Create flashcards function
export const handleCreateFlashcards = async (terms, setFlashcards, setView, setCurrentSet) => {
    try {
        if (!Array.isArray(terms) || terms.length === 0) {
            console.error("Expected terms to be a non-empty array, but got:", terms);
            return;
        }

        const prompt = `Define each of the following terms:\n${terms.join("\n")}`;
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
            .filter(card => card.term && card.definition);

        // Create a set and link flashcards with its ID
        const setData = { name: "New Set" };
        const setResponse = await axios.post("http://localhost:8080/sets/create", setData, {
            headers: { "Content-Type": "application/json" }
        });
        const createdSet = setResponse.data;
        setCurrentSet(createdSet);

        const flashcardsWithSetId = flashcards.map(flashcard => ({
            term: flashcard.term,
            definition: flashcard.definition,
            set_num: createdSet.id
        }));

        await axios.post("http://localhost:8080/flashcards/batchCreate", flashcardsWithSetId, {
            headers: { "Content-Type": "application/json" }
        });

        setFlashcards(flashcardsWithSetId);
        setView("flashcards");
    } catch (error) {
        console.error("Error creating flashcards:", error);
    }
};

// Function to handle file upload to the backend, which will send it to the ChatGPT API
export const handleFileUpload = async (file, setText, setTerms, setFlashcards, setView) => {
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
            const parsedContent = response.data.parsedContent;

            setText(parsedContent);
            await handleExtractTerms(parsedContent, setTerms, setFlashcards, setView);
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};
