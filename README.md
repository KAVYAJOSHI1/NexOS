# NexOS 🧠✨
**Your Digital Twin for the Web.**

NexOS is a local-first AI Agent that lives in your browser. It doesn't just "generate text"—it acts as **You**. Integrated with **n8n** and **Google Gemini**, NexOS learns your Identity Profile to draft replies, polish emails, and rewrite messages in your unique voice.

![NexOS Interface](https://via.placeholder.com/800x400?text=NexOS+Premium+UI)

## 🚀 Key Features

### 1. True Dual Mode ⚔️
NexOS understands context and adapts its behavior instantly:

*   **💬 Reply Mode (Incoming Messages)**
    *   **Action**: Select any text on a webpage.
    *   **Trigger**: Click the **Pink "Reply" Button** that floats nearby.
    *   **Result**: NexOS reads the incoming message and drafts a contextual reply in the first person ("I").
    *   *Perfect for: WhatsApp, Twitter DMs, LinkedIn, Gmail.*

*   **✨ Rewrite Mode (Your Drafts)**
    *   **Action**: Type a rough draft in any input box (e.g., "i fix bug").
    *   **Trigger**: Click the **Blue "Rewrite" Button** floating near your cursor.
    *   **Result**: NexOS polishes your grammar and tone into professional English without changing the meaning.
    *   *Perfect for: Slack updates, quick emails, coding comments.*

### 2. Digital Twin Persona 👤
Unlike generic AI tools, NexOS is hard-coded to be **You**.
*   **First-Person Voice**: Always writes as "I", never "As an AI".
*   **Tone Matching**: Configured to be "Casual, Smart, Tech-Savvy" (customizable).
*   **Identity Injection**: Every request carries your specific Persona instructions.

### 3. Premium Experience 🎨
*   **Glassmorphism UI**: Beautiful, frosted-glass modals and buttons.
*   **Fluid Animations**: Smooth pops, slides, and transitions.
*   **Smart Notifications**: Non-intrusive "Toast" notifications for actions like Copy/Insert.

### 4. Privacy & Control 🔒
*   **Local-First Backend**: Your "Brain" runs on a local **n8n** docker container.
*   **Zero Data Leaks**: Your chats are processed locally or via your own API keys.
*   **Open Source**: You control the code, the prompt, and the identity.

---

## 🛠️ Architecture

NexOS consists of two main components:

1.  **Chrome Extension (The Body)**
    *   **Tech**: React, Vite, CRXJS.
    *   **Role**: Handles UI, DOM interaction (Input/Selection detection), and User Events.
    *   **Style**: Pure CSS with Glassmorphism variables.

2.  **n8n Workflow (The Brain)**
    *   **Tech**: Docker, n8n, Google Gemini (or Ollama/GROQ).
    *   **Role**: Receives text context, applies the "Identity System", and generates the final response.

---

## 📦 Installation Guide

### Prerequisites
*   Docker & Docker Compose
*   Node.js (for building the extension)
*   Google Gemini API Key

### Step 1: Start the Brain (n8n)
```bash
cd infrastructure
docker-compose up -d
```
1.  Open [http://localhost:5678](http://localhost:5678).
2.  Import the workflow `infrastructure/n8n_workflow_draft.json`.
3.  Add your Google Gemini Credentials.
4.  Activate the workflow.

### Step 2: Build the Body (Extension)
```bash
cd chrome-extension
npm install
npm run build
```

### Step 3: Load into Chrome
1.  Go to `chrome://extensions`.
2.  Enable **Developer Mode**.
3.  Click **Load Unpacked**.
4.  Select the `chrome-extension/dist` folder.

---

## 🌟 Usage

1.  **To Reply**: Highlight a message -> Click **💬 Reply**.
2.  **To Rewrite**: Type a draft -> Click **✨ Rewrite**.
3.  **Review**: A Glass Modal appears with the AI's output.
4.  **Insert**: Click "Insert" to paste it directly into the chat.

---

*"It's not just Autocomplete. It's You, multiplied."*
