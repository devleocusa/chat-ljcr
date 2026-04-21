const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const userInputLabel = document.getElementById("userInputLabel");
const quickButtons = document.querySelectorAll(".quick-btn");
const creditsInfo = document.getElementById("creditsInfo");

const STARTING_CREDITS = 1000;
const MESSAGE_COST = 100;
const DEFAULT_LABEL_TEXT = "Escribe tu pregunta";
const INSUFFICIENT_LABEL_TEXT = "Créditos nulos o insuficientes!";
let credits = STARTING_CREDITS;

function updateCreditsUI() {
  const hasInsufficientCredits = credits < MESSAGE_COST;
  creditsInfo.textContent = `Creditos: ${credits}`;
  creditsInfo.classList.toggle("insufficient", hasInsufficientCredits);
  userInput.classList.toggle("insufficient", hasInsufficientCredits);
  userInputLabel.textContent = hasInsufficientCredits
    ? INSUFFICIENT_LABEL_TEXT
    : DEFAULT_LABEL_TEXT;
  userInput.placeholder = hasInsufficientCredits
    ? INSUFFICIENT_LABEL_TEXT
    : "Escribe una pregunta...";
}

function trySpendCredits() {
  if (credits < MESSAGE_COST) {
    userInput.classList.add("insufficient");
    alert("No tienes creditos suficientes para enviar otro mensaje.");
    return false;
  }

  credits -= MESSAGE_COST;
  updateCreditsUI();
  return true;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function getFormattedDate() {
  return new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getFormattedTime() {
  return new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getMessageTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function resolveSum(rawQuestion) {
  const sumMatch = rawQuestion
    .toLowerCase()
    .match(/^\s*suma\s+(-?\d+(?:[.,]\d+)?)\s*\+\s*(-?\d+(?:[.,]\d+)?)\s*$/);

  if (!sumMatch) return null;

  const first = Number(sumMatch[1].replace(",", "."));
  const second = Number(sumMatch[2].replace(",", "."));

  if (Number.isNaN(first) || Number.isNaN(second)) return null;
  return first + second;
}

function getSimpleResponse(rawQuestion) {
  const question = normalizeText(rawQuestion);
  const sumResult = resolveSum(rawQuestion);

  if (sumResult !== null) {
    return `El resultado es ${sumResult}.`;
  }

  if (question === "fecha") {
    return `Hoy es ${getFormattedDate()}.`;
  }

  if (question === "clima") {
    return "El clima de hoy está soleado.";
  }

  if (question === "hora") {
    return `La hora actual es ${getFormattedTime()}.`;
  }

  if (question === "saludo") {
    return "Hola, espero que tengas un excelente día.";
  }

  return "Pregunta no válida. Usa: fecha, clima, hora, saludo o suma 2 + 2.";
}

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `message ${sender}`;

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = getMessageTime();

  bubble.appendChild(content);
  bubble.appendChild(time);
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleQuestion(question) {
  if (!question.trim()) return;
  if (!trySpendCredits()) return;
  addMessage(question, "user");
  const answer = getSimpleResponse(question);
  setTimeout(() => addMessage(answer, "bot"), 160);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = userInput.value;
  handleQuestion(question);
  userInput.value = "";
  userInput.focus();
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    userInput.value = button.dataset.question || "";
    userInput.focus();
  });
});

updateCreditsUI();

addMessage(
  "Escribe: fecha, clima, hora, saludo o una suma como 'suma 2 + 2'.",
  "bot"
);