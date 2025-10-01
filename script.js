// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, onChildAdded } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Your Firebase configuration (from console)
const firebaseConfig = {
  apiKey: "AIzaSyCMjhaUNTBq_FFux0pNG9e3poFmylJq61Y",
  authDomain: "livechat-a21f3.firebaseapp.com",
  databaseURL: "https://livechat-a21f3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "livechat-a21f3",
  storageBucket: "livechat-a21f3.firebasestorage.app",
  messagingSenderId: "907160810613",
  appId: "1:907160810613:web:d716e8fa9123c66218f43c",
  measurementId: "G-JQCZHE8ZNT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const nicknameInput = document.getElementById("nickname");
const enterBtn = document.getElementById("enterChat");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const changeNickBtn = document.getElementById("changeNick");

let nickname = localStorage.getItem("chat_nick") || "";

// Escape HTML to prevent XSS
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Add a message to chat UI
function addMessageToUI(msg) {
  const div = document.createElement("div");
  div.className = "message";
  const time = msg.time ? new Date(msg.time).toLocaleTimeString() : "";
  div.innerHTML = `<div class="meta">${escapeHtml(msg.name || "anon")} · ${time}</div>
                   <div class="text">${escapeHtml(msg.text || "")}</div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// If nickname exists, skip login
if (nickname) {
  nicknameInput.value = nickname;
  loginScreen.style.display = "none";
  chatScreen.style.display = "block";
} else {
  loginScreen.style.display = "block";
  chatScreen.style.display = "none";
}

// Enter chat
enterBtn.onclick = () => {
  const val = nicknameInput.value.trim();
  if (!val) return alert("Please enter a nickname");
  nickname = val.slice(0, 20);
  localStorage.setItem("chat_nick", nickname);
  loginScreen.style.display = "none";
  chatScreen.style.display = "block";
  messageInput.focus();
};

// Change nickname
changeNickBtn.onclick = () => {
  localStorage.removeItem("chat_nick");
  nickname = "";
  nicknameInput.value = "";
  messagesDiv.innerHTML = "";
  loginScreen.style.display = "block";
  chatScreen.style.display = "none";
};

// Send a message
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  if (!nickname) return alert("Enter a nickname first");

  const messageObj = {
    name: nickname,
    text: text.slice(0, 500),
    time: Date.now()
  };

  push(ref(db, "messages"), messageObj)
    .then(() => {
      messageInput.value = "";
    })
    .catch((err) => {
      console.error("Error sending:", err);
      alert("Failed to send message, check console");
    });
}

// Listen for new messages
const messagesQuery = query(ref(db, "messages"), orderByChild("time"));
onChildAdded(messagesQuery, (snapshot) => {
  const msg = snapshot.val();
  addMessageToUI(msg);
});
