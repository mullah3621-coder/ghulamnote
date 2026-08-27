const API_URL_WS = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// --- Auth Check ---
if (!token) {
    window.location.href = "login.html";
}

// --- Parse docId from URL ---
const urlParams = new URLSearchParams(window.location.search);
const docId = parseInt(urlParams.get("docId"));

if (!docId) {
    window.location.href = "dashboard.html";
}

// --- Initialize Components ---
let pdfViewer;
let notesEditor;

async function init() {
    try {
        // Load document title
        await loadDocTitle();

        // Initialize PDF Viewer
        pdfViewer = new PdfViewer(docId, token);
        await pdfViewer.loadPdf();

        // Initialize Notes Editor
        notesEditor = new NotesEditor(docId, token);

        // AI Summarize Button
        document.getElementById("summarizeBtn").addEventListener("click", summarizePage);

        // AI Ask Button
        document.getElementById("askAiBtn").addEventListener("click", askAi);
        document.getElementById("aiInput").addEventListener("keypress", (e) => {
            if (e.key === "Enter") askAi();
        });

    } catch (err) {
        console.error("Initialization error:", err);
        alert("Failed to load document. Returning to dashboard.");
        window.location.href = "dashboard.html";
    }
}

// --- Load Document Title ---
async function loadDocTitle() {
    try {
        const res = await fetch(`${API_URL_WS}/documents`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            const docs = await res.json();
            const doc = docs.find(d => d.id === docId);
            if (doc) {
                document.getElementById("docTitle").textContent = doc.fileName;
            }
        }
    } catch (err) {
        console.error("Error loading doc title:", err);
    }
}

// --- AI: Summarize Current Page ---
async function summarizePage() {
    const responseEl = document.getElementById("aiResponse");
    const summarizeBtn = document.getElementById("summarizeBtn");

    summarizeBtn.disabled = true;
    summarizeBtn.textContent = "Summarizing...";
    responseEl.innerHTML = "<p>Reading PDF and thinking...</p>";
    responseEl.classList.add("visible");

    try {
        // Get PDF text from current page
        const pdfText = await pdfViewer.getPageText(pdfViewer.getCurrentPage());
        const notesContent = notesEditor.getContent();

        const combinedText = `PDF Content:\n${pdfText}\n\nMy Notes:\n${notesContent}`;

        const res = await fetch(`${API_URL_WS}/ai/summarize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: combinedText })
        });

        const data = await res.json();
        responseEl.innerHTML = `<p>${escapeHtmlWs(data.response || data.message || "No summary generated.")}</p>`;
    } catch (err) {
        responseEl.innerHTML = "<p>Failed to get summary. Please try again.</p>";
    } finally {
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = "✨ Summarize";
    }
}

// --- AI: Ask Question ---
async function askAi() {
    const input = document.getElementById("aiInput");
    const responseEl = document.getElementById("aiResponse");
    const askBtn = document.getElementById("askAiBtn");

    const question = input.value.trim();
    if (!question) return;

    askBtn.disabled = true;
    askBtn.textContent = "Asking...";
    responseEl.innerHTML = "<p>Reading PDF and thinking...</p>";
    responseEl.classList.add("visible");

    try {
        // Get ALL PDF text
        const pdfText = await pdfViewer.getAllPagesText();

        const res = await fetch(`${API_URL_WS}/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question, pdfText })
        });

        const data = await res.json();
        responseEl.innerHTML = `<p>${escapeHtmlWs(data.response || data.message || "No response.")}</p>`;
        input.value = "";
    } catch (err) {
        responseEl.innerHTML = "<p>Failed to get response. Please try again.</p>";
    } finally {
        askBtn.disabled = false;
        askBtn.textContent = "Ask";
    }
}

// --- Escape HTML ---
function escapeHtmlWs(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// --- Start ---
init();
