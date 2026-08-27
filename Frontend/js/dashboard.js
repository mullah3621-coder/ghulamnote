const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

// --- Auth Check ---
if (!token) {
    window.location.href = "login.html";
}

// --- Display User Name ---
document.getElementById("userName").textContent = user.name || "User";

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

// --- Upload Area ---
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const uploadProgress = document.getElementById("uploadProgress");
const progressFill = document.getElementById("progressFill");
const uploadMessage = document.getElementById("uploadMessage");

uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".pdf")) {
        uploadFile(file);
    }
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
});

// --- Upload File ---
async function uploadFile(file) {
    uploadMessage.textContent = "";
    uploadMessage.className = "upload-message";
    uploadProgress.style.display = "block";
    progressFill.style.width = "0%";

    const formData = new FormData();
    formData.append("file", file);

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = percent + "%";
            }
        });

        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                uploadMessage.textContent = "File uploaded successfully!";
                uploadMessage.className = "upload-message success";
                loadDocuments();
            } else {
                uploadMessage.textContent = data.message || "Upload failed";
                uploadMessage.className = "upload-message error";
            }
            uploadProgress.style.display = "none";
            fileInput.value = "";
        };

        xhr.onerror = function () {
            uploadMessage.textContent = "Server error. Try again.";
            uploadMessage.className = "upload-message error";
            uploadProgress.style.display = "none";
        };

        xhr.open("POST", `${API_URL}/documents/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
    } catch (err) {
        uploadMessage.textContent = "Upload failed";
        uploadMessage.className = "upload-message error";
        uploadProgress.style.display = "none";
    }
}

// --- Load Documents ---
async function loadDocuments() {
    const listEl = document.getElementById("documentsList");
    listEl.innerHTML = '<p class="loading">Loading documents...</p>';

    try {
        const res = await fetch(`${API_URL}/documents`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const docs = await res.json();

        if (docs.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><p>No documents yet. Upload a PDF to get started!</p></div>';
            return;
        }

        listEl.innerHTML = docs.map(doc => `
            <div class="doc-card">
                <div class="doc-icon">📄</div>
                <div class="doc-name">${escapeHtml(doc.fileName)}</div>
                <div class="doc-date">${new Date(doc.uploadDate).toLocaleDateString()}</div>
                <div class="doc-actions">
                    <button class="btn-open" onclick="openWorkspace(${doc.id})">Open Workspace</button>
                    <button class="btn-delete" onclick="deleteDocument(${doc.id})">Delete</button>
                </div>
            </div>
        `).join("");
    } catch (err) {
        listEl.innerHTML = '<p class="loading">Failed to load documents</p>';
    }
}

// --- Open Workspace ---
function openWorkspace(docId) {
    window.location.href = `workspace.html?docId=${docId}`;
}

// --- Delete Document ---
async function deleteDocument(docId) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
        const res = await fetch(`${API_URL}/documents/${docId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            loadDocuments();
        }
    } catch (err) {
        alert("Failed to delete document");
    }
}

// --- Escape HTML ---
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// --- Initial Load ---
loadDocuments();
