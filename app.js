// Application Memory State Variables
let currentUserName = localStorage.getItem("kungaarts_username") || "Umushyitsi";
let isProfileCreated = localStorage.getItem("kungaarts_profile_active") === "true";
let selectedImageBase64 = null;

// Initialize Event Handlers when DOM content finishes loading safely
document.addEventListener("DOMContentLoaded", () => {
    // Load previously saved chat history if it exists
    loadChatHistory();

    // Check if profile exists; if not, open setup window after a short delay
    if (!isProfileCreated) {
        setTimeout(() => {
            openProfileModal();
        }, 600);
    } else {
        // Hide warning banner if profile is already active from a past session
        document.getElementById('warningBanner').style.display = 'none';
    }

    // Bind Event Listeners
    document.getElementById("navRegister").addEventListener("click", openProfileModal);
    document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
    document.getElementById("file-input").addEventListener("change", handleFileSelect);
    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    
    document.getElementById("roomGlobal").addEventListener("click", function() {
        switchRoom(this, 'Urubuga Rusange (Global Lounge)');
    });
    
    document.getElementById("roomGroup").addEventListener("click", function() {
        switchRoom(this, 'Itsinda ryanjye (My Group)');
    });

    document.getElementById("searchArtistsBtn").addEventListener("click", searchArtists);
    document.getElementById("searchRegionBtn").addEventListener("click", searchRegion);
});

function openProfileModal() {
    document.getElementById('profileModal').style.display = 'flex';
    // Pre-populate input if username exists
    if(isProfileCreated) {
        document.getElementById('usernameInput').value = currentUserName;
    }
}

function saveProfile() {
    const nameInput = document.getElementById('usernameInput').value.trim();
    if(nameInput === "") {
        alert("Nyamuneka andika izina ryiza!");
        return;
    }
    
    currentUserName = nameInput;
    isProfileCreated = true;
    
    // Save state values to browser storage
    localStorage.setItem("kungaarts_username", currentUserName);
    localStorage.setItem("kungaarts_profile_active", "true");
    
    document.getElementById('profileModal').style.display = 'none';
    document.getElementById('warningBanner').style.display = 'none';

    saveAndAppendSystemMessage(`Profil ya ${currentUserName} yakozwe neza! Noneho urashobora kohereza ubutumwa.`);
}

function switchRoom(element, roomName) {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('currentRoomTitle').innerText = `Icyumba urimo: ${roomName}`;
    
    saveAndAppendSystemMessage(`Winjiye mu cyumba: ${roomName}`);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('file-preview-text').innerText = `Selected: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function sendMessage() {
    const textInput = document.getElementById('messageInput');
    const messageText = textInput.value.trim();

    if (!messageText && !selectedImageBase64) {
        return; 
    }

    const messageData = {
        type: "sent",
        sender: currentUserName,
        text: messageText,
        image: selectedImageBase64,
        timestamp: "Just Now"
    };

    // Save to LocalStorage History Stream array
    let history = JSON.parse(localStorage.getItem("kungaarts_chat_history")) || [];
    history.push(messageData);
    localStorage.setItem("kungaarts_chat_history", JSON.stringify(history));

    renderUserMessage(messageData);
    
    // Reset inputs securely
    textInput.value = "";
    selectedImageBase64 = null;
    document.getElementById('file-input').value = "";
    document.getElementById('file-preview-text').innerText = "";
}

function renderUserMessage(data) {
    const chatLog = document.getElementById('chatMessages');
    let messageHTML = `
        <div class="message sent">
            <div class="meta-info">${data.sender} • ${data.timestamp}</div>
            <div>${data.text}</div>
    `;

    if (data.image) {
        messageHTML += `<img src="${data.image}" alt="Uploaded file">`;
    }

    messageHTML += `</div>`;
    chatLog.innerHTML += messageHTML;
    chatLog.scrollTop = chatLog.scrollHeight;
}

function saveAndAppendSystemMessage(text) {
    const chatLog = document.getElementById('chatMessages');
    const systemData = { type: "system", text: text };
    
    let history = JSON.parse(localStorage.getItem("kungaarts_chat_history")) || [];
    history.push(systemData);
    localStorage.setItem("kungaarts_chat_history", JSON.stringify(history));

    chatLog.innerHTML += `<div class="message system">${text}</div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem("kungaarts_chat_history")) || [];
    history.forEach(msg => {
        if(msg.type === "system") {
            document.getElementById('chatMessages').innerHTML += `<div class="message system">${msg.text}</div>`;
        } else {
            renderUserMessage(msg);
        }
    });
}

function searchArtists() {
    const query = prompt("Andika izina ry'umuhanzi ushakisha:");
    if(query) alert(`Gushakisha umuhanzi: "${query}"...`);
}

function searchRegion() {
    const query = prompt("Andika Akarere ushakamo abahanzi:");
    if(query) alert(`Gushakisha abahanzi mu Karere ka: "${query}"...`);
}
