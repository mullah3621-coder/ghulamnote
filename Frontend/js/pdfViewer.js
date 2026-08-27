const API_URL = "http://localhost:5000/api";

class PdfViewer {
    constructor(docId, token) {
        this.docId = docId;
        this.token = token;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.rendering = false;

        this.canvas = document.getElementById("pdfCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.prevBtn = document.getElementById("prevPage");
        this.nextBtn = document.getElementById("nextPage");
        this.currentPageEl = document.getElementById("currentPage");
        this.totalPagesEl = document.getElementById("totalPages");

        this.prevBtn.addEventListener("click", () => this.prevPage());
        this.nextBtn.addEventListener("click", () => this.nextPage());

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    async loadPdf() {
        const url = `${API_URL}/documents/${this.docId}/file`;

        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${this.token}` }
        });

        if (!response.ok) {
            throw new Error("Failed to load PDF");
        }

        const arrayBuffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);

        this.pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;
        this.totalPages = this.pdfDoc.numPages;
        this.currentPage = 1;

        this.totalPagesEl.textContent = this.totalPages;
        this.updateButtons();

        await this.renderPage(this.currentPage);
    }

    async renderPage(pageNum) {
        if (this.rendering) return;
        this.rendering = true;

        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale });

            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;
        } catch (err) {
            console.error("Error rendering page:", err);
        } finally {
            this.rendering = false;
        }
    }

    async goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPage) return;

        // Dispatch event BEFORE changing page (so notes can save)
        const event = new CustomEvent("pdfPageChanging", {
            detail: { oldPage: this.currentPage, newPage: pageNum }
        });
        document.dispatchEvent(event);

        this.currentPage = pageNum;
        this.currentPageEl.textContent = pageNum;
        this.updateButtons();
        await this.renderPage(pageNum);

        // Dispatch event AFTER page changed (so notes can load)
        const changedEvent = new CustomEvent("pdfPageChanged", {
            detail: { pageNumber: pageNum }
        });
        document.dispatchEvent(changedEvent);
    }

    async nextPage() {
        await this.goToPage(this.currentPage + 1);
    }

    async prevPage() {
        await this.goToPage(this.currentPage - 1);
    }

    updateButtons() {
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    async getPageText(pageNum) {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            return textContent.items.map(item => item.str).join(' ');
        } catch (err) {
            console.error("Error extracting text:", err);
            return "";
        }
    }

    async getAllPagesText() {
        let allText = "";
        for (let i = 1; i <= this.totalPages; i++) {
            const text = await this.getPageText(i);
            allText += `Page ${i}: ${text}\n\n`;
        }
        return allText;
    }
}
