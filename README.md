# CodeSense AI ⚡

An AI-powered code review platform that analyzes your code and generates expert-level improvement suggestions using **Google Gemini 2.0 Flash**.

## 🖥️ Tech Stack

**Backend:** Node.js, Express.js, REST API, Google Gemini AI  
**Frontend:** React.js, Vite, react-simple-code-editor, react-markdown

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Anumishra02/CodeSenseAI.git
cd CodeSenseAI
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Add your Gemini API key to .env:
# GOOGLE_GEMINI_KEY=your_key_here

npm run dev       # development (nodemon)
# or
npm start         # production
```
Backend runs on **http://localhost:3000**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

---

## 📁 Project Structure

```
CodeSenseAI/
├── backend/
│   ├── controllers/
│   │   └── ai.controller.js     # Request handling & validation
│   ├── routes/
│   │   └── ai.routes.js         # API route definitions
│   ├── services/
│   │   └── ai.service.js        # Gemini AI integration
│   ├── app.js                   # Express app setup
│   ├── server.js                # Entry point
│   ├── .env.example             # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main UI component
    │   ├── App.css              # Component styles
    │   ├── index.css            # Global styles & CSS variables
    │   └── main.jsx             # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔑 Environment Variables

| Variable           | Description                  |
|--------------------|------------------------------|
| `GOOGLE_GEMINI_KEY`| Your Google Gemini API key   |
| `PORT`             | Server port (default: 3000)  |

Get your free Gemini API key at [aistudio.google.com](https://aistudio.google.com)

---

## ✨ Features

- 🤖 **AI-Powered Reviews** — Gemini 2.0 Flash analyzes code for correctness, efficiency, security, and best practices
- 🎨 **Multi-Language Support** — JavaScript, Python, Java, C, C++ with syntax highlighting
- ⚡ **Real-time Feedback** — Clean markdown-rendered review output
- 🛡️ **Secure Backend** — Input validation, error handling, CORS configured
- 📱 **Clean UI** — Dark theme, responsive split-panel editor

---

## 📡 API

### POST `/ai/get-review`
```json
Request:  { "code": "your code here" }
Response: "Markdown-formatted review string"
```

---

## 🏗️ Built by
**Anu Mishra** — [GitHub](https://github.com/Anumishra02) | [LinkedIn](https://linkedin.com/in/anumish)
