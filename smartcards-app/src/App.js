'use client'
import axios from 'axios';
import React, { useState } from "react";
import './App.css';
import { handleExtractTerms, handleCreateFlashcards } from "./func";

export default function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setIsFlipped(false);
    };

    const handlePrevious = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleAddFlashcard = () => {
        const newFlashcard = { term: "New Term", definition: "New Definition" };
        setFlashcards([...flashcards, newFlashcard]);
    };

    const handleDeleteFlashcard = async (index) => {
        try {
            const flashcardToDelete = flashcards[index]; // Get the flashcard to be deleted

            // Step 1: Send a DELETE request to the backend API to delete the flashcard from the database
            await axios.delete(`http://localhost:3001/api/flashcards/${flashcardToDelete.id}`);

            // Step 2: Remove the flashcard from the frontend state
            const updatedFlashcards = flashcards.filter((_, i) => i !== index);

            // Step 3: Update the flashcards state and adjust the current card index
            setFlashcards(updatedFlashcards);
            setCurrentCardIndex(Math.min(currentCardIndex, updatedFlashcards.length - 1));

        } catch (error) {
            console.error("Error deleting flashcard:", error);
        }
    };


    const handleSaveEdit = (index, editedTerm, editedDefinition) => {
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[index] = { term: editedTerm, definition: editedDefinition };
        setFlashcards(updatedFlashcards);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Key Term Extractor & Flashcard Creator</h1>
                <div className="flex justify-center space-x-4 mb-6">
                    <button onClick={() => setView("extract")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Extract Key Terms</button>
                    <button onClick={() => setView("flashcards")} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">View Flashcards</button>
                    <button onClick={() => setView("edit")} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">Edit Flashcards</button>
                </div>

                {view === "extract" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Input Text to Extract Key Terms</h2>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={6}
                            className="w-full p-2 border rounded mb-4"
                            placeholder="Enter text here..."
                        />
                        <button onClick={() => handleExtractTerms(text, setTerms)} className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Extract Terms</button>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Extracted Key Terms:</h3>
                            <ul className="list-disc pl-5">
                                {terms.map((term, index) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {view === "flashcards" && flashcards.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Enter Key Terms for Flashcards</h2>
                        <textarea
                            value={terms.join(", ")}
                            onChange={(e) => setTerms(e.target.value.split(", "))}
                            rows={3}
                            className="w-full p-2 border rounded mb-4"
                            placeholder="Enter key terms separated by commas..."
                        />
                        <button onClick={() => handleCreateFlashcards(terms, setFlashcards, setView)} className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">Create Flashcards</button>
                    </div>
                )}

                {view === "flashcards" && flashcards.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flashcard mb-4" onClick={handleFlip}>
                            <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                <div className="flashcard-front bg-blue-100 p-4 rounded">
                                    <p className="text-xl font-semibold text-center">{flashcards[currentCardIndex].term}</p>
                                </div>
                                <div className="flashcard-back bg-green-100 p-4 rounded">
                                    <p className="text-lg text-center">{flashcards[currentCardIndex].definition}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mb-4">
                            <button onClick={handlePrevious} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">Previous</button>
                            <button onClick={handleFlip} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">Flip</button>
                            <button onClick={handleNext} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">Next</button>
                        </div>
                        <p className="text-center text-gray-600">
                            Card {currentCardIndex + 1} of {flashcards.length}
                        </p>
                    </div>
                )}

                {view === "edit" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Edit Flashcards</h2>
                        {flashcards.map((flashcard, index) => (
                            <div key={index} className="mb-4 p-4 border rounded">
                                <h3 className="text-lg font-semibold mb-2">Card {index + 1}</h3>
                                <input
                                    type="text"
                                    value={flashcard.term}
                                    onChange={(e) => handleSaveEdit(index, e.target.value, flashcard.definition)}
                                    className="w-full p-2 border rounded mb-2"
                                    placeholder="Term"
                                />
                                <textarea
                                    value={flashcard.definition}
                                    onChange={(e) => handleSaveEdit(index, flashcard.term, e.target.value)}
                                    className="w-full p-2 border rounded mb-2"
                                    placeholder="Definition"
                                    rows={3}
                                />
                                <button onClick={() => handleDeleteFlashcard(index)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        ))}
                        <button onClick={handleAddFlashcard} className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mt-4">Add New Flashcard</button>
                    </div>
                )}
            </div>
        </div>
    );
}