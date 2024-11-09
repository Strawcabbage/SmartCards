import React, { useState } from "react";
import './App.css';
import {
    handleExtractTerms,
    handleCreateFlashcards,
    handleNext,
    handlePrevious,
    handleFlip
} from "./func";

function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

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
                    <button onClick={() => handleExtractTerms(text, setTerms)}>Extract Terms</button>
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
                    <button onClick={() => handleCreateFlashcards(terms, setFlashcards, setView)}>Create Flashcards</button>
                </div>
            )}

            {view === "flashcards" && flashcards.length > 0 && (
                <div className="flashcard-view">
                    <div className="flashcard" onClick={() => handleFlip(isFlipped, setIsFlipped)}>
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
                        <button onClick={() => handlePrevious(currentCardIndex, setCurrentCardIndex, flashcards)}>Previous</button>
                        <button onClick={() => handleFlip(isFlipped, setIsFlipped)}>Flip</button>
                        <button onClick={() => handleNext(currentCardIndex, setCurrentCardIndex, flashcards)}>Next</button>
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
