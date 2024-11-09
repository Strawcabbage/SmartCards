import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleExtractTerms = async () => {
        try {
            console.log("Authorization Header:", `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`);
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `Extract key terms from this text: ${text}`,
                        },
                    ],
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

    const handleCreateFlashcards = async () => {
        try {
            // Create a prompt for generating concise definitions for each term
            const prompt = `Create concise definitions for the following terms. Format each flashcard as 'Term: Definition' on a new line: ${terms.join(", ")}`;

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Generate flashcards from the response
            const generatedFlashcards = response.data.choices[0].message.content
                .split("\n")
                .map((card) => {
                    const [term, ...definitionParts] = card.split(": ");
                    const definition = definitionParts.join(": "); // Rejoin in case the definition contains ":"
                    return { term: term.trim(), definition: definition.trim() };
                })
                .filter((card) => card.term && card.definition); // Remove any cards with blank terms or definitions

            if (generatedFlashcards.length === 0) {
                console.error("No valid flashcards were generated");
                // Optionally, show an error message to the user here
                return;
            }

            setFlashcards(generatedFlashcards);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setView("flashcards");
        } catch (error) {
            console.error("Error creating flashcards:", error);
        }
    };


    const handleNext = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setIsFlipped(false);
    };

    const handlePrevious = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        console.log("Flipping card", !isFlipped); // Check if state is changing
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="App">
            <h1>Key Term Extractor & Flashcard Creator</h1>
            <div className="button-group">
                <button onClick={() => setView("extract")}>Extract Key Terms</button>
                <button onClick={() => setView("flashcards")}>Create Flashcards</button>
            </div>

            {view === "extract" && (
                <div className="extract-view">
                    <h2>Input Text to Extract Key Terms</h2>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows="6"
                        placeholder="Enter text here..."
                    />
                    <button onClick={handleExtractTerms}>Extract Terms</button>
                    <div>
                        <h3>Extracted Key Terms:</h3>
                        <ul>
                            {terms.map((term, index) => (
                                <li key={index}>{term}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {view === "flashcards" && flashcards.length === 0 && (
                <div className="create-flashcards-view">
                    <h2>Enter Key Terms for Flashcards</h2>
                    <textarea
                        value={terms.join(", ")}
                        onChange={(e) => setTerms(e.target.value.split(", "))}
                        rows="3"
                        placeholder="Enter key terms separated by commas..."
                    />
                    <button onClick={handleCreateFlashcards}>Create Flashcards</button>
                </div>
            )}

            {view === "flashcards" && flashcards.length > 0 && (
                <div className="flashcard-view">
                    <div className="flashcard" onClick={handleFlip}>
                        <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
                            <div className="flashcard-front">
                                <p>{flashcards[currentCardIndex].term}</p>
                            </div>
                            <div className="flashcard-back">
                                <p>{flashcards[currentCardIndex].definition}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flashcard-controls">
                        <button onClick={handlePrevious}>Previous</button>
                        <button onClick={handleFlip}>Flip</button>
                        <button onClick={handleNext}>Next</button>
                    </div>
                    <p className="flashcard-count">
                        Card {currentCardIndex + 1} of {flashcards.length}
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;