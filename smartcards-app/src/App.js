import React, { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [terms, setTerms] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [view, setView] = useState("extract");

  const handleExtractTerms = async () => {
    try {
      console.log("Authorization Header:", `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`);
      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions", // API endpoint
          {
            model: "gpt-3.5-turbo", // Specify model
            messages: [
              {
                role: "user",
                content: `Extract key terms from this text: ${text}`, // Prompt to extract terms
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`, // Authorization header
              "Content-Type": "application/json", // Content type
            },
          }
      );
      // Handle response and extract terms
      const extractedTerms = response.data.choices[0].message.content.split(", ");
      setTerms(extractedTerms); // Update terms with extracted terms from the API response
    } catch (error) {
      console.error("Error extracting terms:", error);
    }
  };

  const handleCreateFlashcards = async () => {
    try {
      const response = await axios.post(
          "https://api.openai.com/v1/chat/completions", // API endpoint for creating flashcards
          {
            model: "gpt-3.5-turbo", // Specify model
            messages: [
              {
                role: "user",
                content: `Create flashcards for these terms: ${terms.join(", ")}`, // Prompt to create flashcards
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`, // Authorization header
              "Content-Type": "application/json", // Content type
            },
          }
      );
      // Handle response and generate flashcards
      const generatedFlashcards = response.data.choices[0].message.content.split("\n").map(card => {
        const [term, definition] = card.split(": ");
        return { term, definition };
      });
      setFlashcards(generatedFlashcards); // Set the flashcards from API response
    } catch (error) {
      console.error("Error creating flashcards:", error);
    }
  };

  return (
      <div className="App">
        <h1>Key Term Extractor & Flashcard Creator</h1>
        <div>
          <button onClick={() => setView("extract")}>Extract Key Terms</button>
          <button onClick={() => setView("flashcards")}>Create Flashcards</button>
        </div>

        {view === "extract" && (
            <div>
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

        {view === "flashcards" && (
            <div>
              <h2>Enter Key Terms for Flashcards</h2>
              <textarea
                  value={terms.join(", ")}
                  onChange={(e) => setTerms(e.target.value.split(", "))}
                  rows="3"
                  placeholder="Enter key terms separated by commas..."
              />
              <button onClick={handleCreateFlashcards}>Create Flashcards</button>
              <div>
                <h3>Generated Flashcards:</h3>
                <ul>
                  {flashcards.map((flashcard, index) => (
                      <li key={index}>
                        <strong>{flashcard.term}</strong>: {flashcard.definition}
                      </li>
                  ))}
                </ul>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
