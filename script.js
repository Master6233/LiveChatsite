// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, onChildAdded, set, onValue } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCMjhaUNTBq_FFux0pNG9e3poFmylJq61Y",
  authDomain: "livechat-a21f3.firebaseapp.com",
  databaseURL: "https://livechat-a21f3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "livechat-a21f3",
  storageBucket: "livechat-a21f3.appspot.com", // fixed typo
  messagingSenderId: "907160810613",
  appId: "1:907160810613:web:d716e8fa9123c66218f43c",
  measurementId: "G-JQCZHE8ZNT"
};

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
const roomTitle = document.getElementById("roomTitle");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinCodeBtn = document.getElementById("joinCodeBtn");

let nickname = localStorage.getItem("chat_nick") || "";
let currentRoom = "global1"; // default room

// Escape HTML
function escapeHtml(text) {
  return text.replaceAll("&", "&amp;")
             .replaceAll("<", "&lt;")
             .replaceAll(">", "&gt;")
             .replaceAll('"', "&quot;")
             .replaceAll("'", "&#039;");
}

// Add message to UI
function addMessageToUI(msg) {
  const div = document.createElement("div");
  div.className = "message";
  const time = msg.time ? new Date(msg.time).toLocaleTimeString() : "";
  div.innerHTML = `<div class="meta">${escapeHtml(msg.name || "anon")} · ${time}</div>
                   <div class="text">${escapeHtml(msg.text || "")}</div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Join room
function joinRoom(roomId) {
  currentRoom = roomId;
  messagesDiv.innerHTML = "";
  roomTitle.textContent = "Room: " + roomId;

  // Listen for messages in this room
  const messagesQuery = query(ref(db, "messages/" + currentRoom), orderByChild("time"));
  onChildAdded(messagesQuery, (snapshot) => {
    const msg = snapshot.val();
    addMessageToUI(msg);
  });
}

// Send message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  if (!nickname) return alert("Enter a nickname first");

  const messageObj = {
    name: nickname,
    text: text.slice(0, 500),
    time: Date.now()
  };

  push(ref(db, "messages/" + currentRoom), messageObj)
    .then(() => { messageInput.value = ""; })
    .catch((err) => {
      console.error("Error sending:", err);
      alert("Failed to send message, check console");
    });
}

// Create room
function createRoom() {
  const name = prompt("Room name?");
  if (!name) return;
  const withCode = confirm("Do you want this room to require a code?");
  const roomId = "room-" + Date.now();
  const code = withCode ? Math.random().toString(36).substr(2, 6).toUpperCase() : null;

  set(ref(db, "rooms/" + roomId), {
    name,
    public: !withCode,
    code: code || null
  });

  alert(`Room created! ${withCode ? "Code: " + code : "Public room"}`);
  joinRoom(roomId);
}

// Join room by code
function joinByCode() {
  const code = prompt("Enter room code:");
  if (!code) return;
  const roomsRef = ref(db, "rooms");
  onValue(roomsRef, (snapshot) => {
    const rooms = snapshot.val() || {};
    for (const id in rooms) {
      if (rooms[id].code === code) {
        joinRoom(id);
        return;
      }
    }
    alert("Room not found!");
  }, { onlyOnce: true });
}

// Nickname handling
if (nickname) {
  nicknameInput.value = nickname;
  loginScreen.style.display = "none";
  chatScreen.style.display = "block";
  joinRoom(currentRoom);
} else {
  loginScreen.style.display = "block";
  chatScreen.style.display = "none";
}

enterBtn.onclick = () => {
  const val = nicknameInput.value.trim();
  if (!val) return alert("Please enter a nickname");
  nickname = val.slice(0, 20);
  localStorage.setItem("chat_nick", nickname);
  loginScreen.style.display = "none";
  chatScreen.style.display = "block";
  joinRoom(currentRoom);
  messageInput.focus();
};

changeNickBtn.onclick = () => {
  localStorage.removeItem("chat_nick");
  nickname = "";
  nicknameInput.value = "";
  messagesDiv.innerHTML = "";
  loginScreen.style.display = "block";
  chatScreen.style.display = "none";
};

sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

createRoomBtn.onclick = createRoom;
joinCodeBtn.onclick = joinByCode;
