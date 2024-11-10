'use client'
import axios from 'axios';
import React, { useState } from "react";
import './App.css';
import { handleExtractTerms, handleCreateFlashcards } from "./func";
import LoginButton from "./components/LoginButtion"; // Only import handleExtractTerms if it’s used
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";


export default function App() {
    const [text, setText] = useState("");
    const [terms, setTerms] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [view, setView] = useState("extract");
    const [loginView, setLoginView] = useState("unauthorized")
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    function handleFileChange() {

    }

    const handleCreateFlashcardsClick = async () => {
        try {
            await handleExtractTerms(text, setTerms, setFlashcards, setView);
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
        setIsFlipped(!isFlipped);
    };

    const handleAddFlashcard = () => {
        const newFlashcard = { term: "New Term", definition: "New Definition" };
        setFlashcards([...flashcards, newFlashcard]);
    };

    const handleDeleteFlashcard = async (index) => {
        try {
            const flashcardToDelete = flashcards[index]; // Get the flashcard to be deleted

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
                                        <button onClick={() => handleDeleteFlashcard(index)}
                                                className="delete-button">Delete
                                        </button>
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

