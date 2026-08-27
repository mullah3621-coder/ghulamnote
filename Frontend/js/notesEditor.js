const API_URL_NOTES = "http://localhost:5000/api";

class NotesEditor {
    constructor(docId, token) {
        this.docId = docId;
        this.token = token;
        this.currentPage = 1;
        this.quill = null;
        this.autoSaveTimer = null;
        this.hasChanges = false;
        this.isNewContent = false;

        this.initQuill();
        this.bindEvents();
        this.loadPage(this.currentPage);
    }

    initQuill() {
        this.quill = new Quill("#quillEditor", {
            theme: "snow",
            placeholder: "Start taking notes for this page...",
            modules: {
                toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    ["blockquote", "code-block"],
                    [{ "header": 1 }, { "header": 2 }],
                    [{ "list": "ordered" }, { "list": "bullet" }],
                    ["clean"]
                ]
            }
        });

        // Track changes
        this.quill.on("text-change", () => {
            this.hasChanges = true;
            this.isNewContent = true;
        });
    }

    bindEvents() {
        // Listen for page changes from PDF viewer
        document.addEventListener("pdfPageChanged", async (e) => {
            const newPage = e.detail.pageNumber;
            await this.changePage(newPage);
        });

        // Auto-save every 5 seconds
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, 5000);

        // Save before page change
        document.addEventListener("pdfPageChanging", async (e) => {
            await this.saveCurrentNote();
        });

        // Save before leaving page
        window.addEventListener("beforeunload", () => {
            this.saveCurrentNote();
        });
    }

    async changePage(newPage) {
        // Save current page notes first
        await this.saveCurrentNote();

        // Load new page notes
        this.currentPage = newPage;
        document.getElementById("notePageNum").textContent = newPage;
        await this.loadPage(newPage);
    }

    async loadPage(pageNumber) {
        try {
            const res = await fetch(
                `${API_URL_NOTES}/notes/document/${this.docId}/page/${pageNumber}`,
                {
                    headers: { "Authorization": `Bearer ${this.token}` }
                }
            );

            if (res.ok) {
                const data = await res.json();
                if (data.contentHtml) {
                    this.quill.root.innerHTML = data.contentHtml;
                } else {
                    this.quill.setText("");
                }
                this.hasChanges = false;
                this.isNewContent = false;
            }
        } catch (err) {
            console.error("Error loading note:", err);
        }
    }

    async saveCurrentNote() {
        if (!this.hasChanges) return;

        const contentHtml = this.quill.root.innerHTML;
        const statusEl = document.getElementById("saveStatus");

        statusEl.textContent = "Saving...";
        statusEl.className = "save-status saving";

        try {
            const res = await fetch(
                `${API_URL_NOTES}/notes/document/${this.docId}/page/${this.currentPage}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.token}`
                    },
                    body: JSON.stringify({
                        pageNumber: this.currentPage,
                        contentHtml: contentHtml
                    })
                }
            );

            if (res.ok) {
                this.hasChanges = false;
                statusEl.textContent = "Saved";
                statusEl.className = "save-status";
            } else {
                statusEl.textContent = "Save failed";
                statusEl.className = "save-status";
            }
        } catch (err) {
            console.error("Error saving note:", err);
            statusEl.textContent = "Save error";
            statusEl.className = "save-status";
        }
    }

    autoSave() {
        if (this.hasChanges) {
            this.saveCurrentNote();
        }
    }

    getContent() {
        return this.quill.root.innerHTML;
    }

    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
    }
}
