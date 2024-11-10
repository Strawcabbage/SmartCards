'use client';
import React, { useState } from "react";
import './App.css';
import { handleExtractTerms } from "./func"; // Only import handleExtractTerms if it’s used

export default function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
            const reader = new FileReader();
            reader.onload = (e) => setText(e.target.result);
            reader.onerror = (e) => console.error("File reading error:", e.target.error);
            reader.readAsText(file);
        } else {
            alert("Please select a plain text (.txt) file");
        }
    };

    const handleNext = () => setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    const handlePrevious = () => setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    const handleFlip = () => setIsFlipped(!isFlipped);
    const handleAddFlashcard = () => setFlashcards([...flashcards, { term: "New Term", definition: "New Definition" }]);

    const handleDeleteFlashcard = (index) => {
        const updatedFlashcards = flashcards.filter((_, i) => i !== index);
        setFlashcards(updatedFlashcards);
        setCurrentCardIndex(Math.min(currentCardIndex, updatedFlashcards.length - 1));
    };

    const handleSaveEdit = (index, term, definition) => {
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[index] = { term, definition };
        setFlashcards(updatedFlashcards);
    };

    return (
        <div className="app-container">
            <div className="content-container">
                <h1 className="app-title">SmartCards</h1>
                <div className="button-group">
                    <button onClick={() => setView("extract")} className="view-button extract">Extract Key Terms</button>
                    <button onClick={() => setView("flashcards")} className="view-button view">View Flashcards</button>
                    <button onClick={() => setView("edit")} className="view-button edit">Edit Flashcards</button>
                </div>

                {/* Extract View */}
                {view === "extract" && (
                    <div className="section">
                        <h2>Input Text to Extract Key Terms</h2>
                        <input type="file" onChange={handleFileChange} accept=".txt" className="file-input"/>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={6}
                            className="text-input"
                            placeholder="Enter text here or upload a file..."
                        />
                        <button onClick={() => handleExtractTerms(text, setTerms)} className="action-button extract">Extract Terms</button>
                        <ul className="term-list">
                            {terms.map((term, index) => <li key={index}>{term}</li>)}
                        </ul>
                    </div>
                )}

                {/* Flashcards View */}
                {view === "flashcards" && flashcards.length > 0 && (
                    <div className="section">
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
                        <div className="card-navigation">
                            <button onClick={handlePrevious} className="nav-button">Previous</button>
                            <button onClick={handleFlip} className="nav-button">Flip</button>
                            <button onClick={handleNext} className="nav-button">Next</button>
                        </div>
                        <p>Card {currentCardIndex + 1} of {flashcards.length}</p>
                    </div>
                )}

                {/* Edit Flashcards View */}
                {view === "edit" && (
                    <div className="section">
                        <h2>Edit Flashcards</h2>
                        {flashcards.map((flashcard, index) => (
                            <div key={index} className="flashcard-edit">
                                <input
                                    type="text"
                                    value={flashcard.term}
                                    onChange={(e) => handleSaveEdit(index, e.target.value, flashcard.definition)}
                                    className="text-input"
                                    placeholder="Term"
                                />
                                <textarea
                                    value={flashcard.definition}
                                    onChange={(e) => handleSaveEdit(index, flashcard.term, e.target.value)}
                                    rows={3}
                                    className="text-input"
                                    placeholder="Definition"
                                />
                                <button onClick={() => handleDeleteFlashcard(index)} className="delete-button">Delete</button>
                            </div>
                        ))}
                        <button onClick={handleAddFlashcard} className="action-button add">Add New Flashcard</button>
                    </div>
                )}
            </div>
        </div>
    );
}
