const express = require('express');
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors({ origin: 'http://localhost:3000'
})); // Replace with your frontend's origin

app.post('/upload', (req, res) => {
    // Handle file upload and API call logic here
    res.send('File uploaded successfully');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        let text = '';

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer);
            text = pdfData.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docxData = await mammoth.extractRawText({ buffer: file.buffer });
            text = docxData.value;
        } else if (file.mimetype === 'text/plain') {
            text = file.buffer.toString('utf-8');
        } else {
            return res.status(400).send('Unsupported file type.');
        }

        const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: text
            }],
            max_tokens: 500,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
                'Content-Type': 'application/json'
            }
        });

        const parsedContent = openAIResponse.data.choices[0].message.content;

        res.json({ parsedContent });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing the file.');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});