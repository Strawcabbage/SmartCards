'use client'
import axios from 'axios';
import React, { useState } from "react";
import './App.css';
import { handleExtractTerms, handleCreateFlashcards } from "./func";
import LoginButton from "./components/LoginButtion";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";

export default function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [loginView, setLoginView] = useState("unauthorized");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentSet, setCurrentSet] = useState(null);  // Track the current set

    const handleCreateFlashcardsClick = async () => {
        try {
            // Convert text to terms array if it's a single string
            const termsArray = Array.isArray(text) ? text : text.split(' ').filter(word => word.length > 2);

            await handleCreateFlashcards(termsArray, setFlashcards, setView, setCurrentSet);
        } catch (error) {
            console.error("Error creating flashcards:", error);
        }
    };

    const handleAddFlashcard = async () => {
        if (!currentSet) {
            console.error("No set selected.");
            return;
        }

        const newFlashcard = { term: "New Term", definition: "New Definition", set_id: currentSet.id };

        try {
            // Add the new flashcard to the backend database
            const response = await axios.post("http://localhost:8080/flashcards/create", newFlashcard, {
                headers: { "Content-Type": "application/json" }
            });

            // Update frontend state to include the new flashcard
            setFlashcards([...flashcards, response.data]);
        } catch (error) {
            console.error("Error adding flashcard:", error);
        }
    };

    function handleFileChange() {

    }

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

    const handleDeleteFlashcard = async (flashcardId) => {
        try {
            // Send DELETE request to the backend to remove the flashcard from the database
            await axios.delete(`http://localhost:8080/flashcards/delete/${flashcardId}`, {
                headers: { "Content-Type": "application/json" }
            });

            // Remove the flashcard from the frontend state by filtering out the deleted one
            const updatedFlashcards = flashcards.filter(flashcard => flashcard.id !== flashcardId);
            setFlashcards(updatedFlashcards);

            // Adjust the current card index if necessary
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

    // Handle file upload and send to backend for processing by ChatGPT API


    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        axios.post('http://localhost:8080/upload',
            formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('File uploaded successfully:', response.data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);

            });
    };

    return (
        <>
        {loginView === "unauthorized" && (
            <>


                <button className="loginButton" onClick={() => (setLoginView("authorized"))}>
                    <LoginButton/>
                    <Profile/>
                </button>
            </>

        )
        }

            {
                loginView === "authorized" && (

                    <div className="app-container">
                        <div className="content-container">




                            <h1 className="app-title">SmartCards</h1>
                        <div className="button-group">
                            <button onClick={() => setView("extract")} className="view-button extract">Extract Key Terms
                            </button>
                            <button onClick={() => setView("flashcards")} className="view-button view">View Flashcards
                            </button>
                            <button onClick={() => setView("edit")} className="view-button edit">Edit Flashcards</button>
                        </div>

                            {/* Extract View */}
                            {view === "extract" && (
                                <div className="section">
                                    <h2>Input Text to Extract Key Terms</h2>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        rows={6}
                                        className="text-input"
                                        placeholder="Enter text here..."
                                    />
                                    <button onClick={handleCreateFlashcardsClick} className="action-button add">
                                        Extract Terms and Create Flashcards
                                    </button>
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

                                        <button onClick={() => handleDeleteFlashcard(flashcard.id)} className="delete-button">Delete</button>
                                    </div>
                                ))}
                                <button onClick={handleAddFlashcard} className="action-button add">Add New Flashcard
                                </button>
                            </div>
                        )}
                            <LogoutButton/>
                    </div>
                </div>

            )
            }
        </>

    );
}

