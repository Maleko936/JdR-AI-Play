const contextKey = "jdr-ai-context";
const inventoryKey = "jdr-ai-inventory";
const charactersKey = "jdr-ai-characters";
const heroKey = "jdr-ai-hero";

const worldContext = document.getElementById("world-context");
const saveContextButton = document.getElementById("save-context");
const inventoryList = document.getElementById("inventory");
const charactersList = document.getElementById("characters");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const heroInputs = {
  name: document.getElementById("hero-name"),
  class: document.getElementById("hero-class"),
  level: document.getElementById("hero-level"),
  hp: document.getElementById("hero-hp"),
  skill: document.getElementById("hero-skill"),
};

const state = {
  inventory: [],
  characters: [],
};

const introLines = [
  "Bienvenue sur votre table de jeu. Chargez un contexte, définissez vos personnages et lancez une scène !",
  "Démo : l'IA répond avec un script statique. Branchez votre API pour un MJ réel.",
];

function loadState() {
  worldContext.value = localStorage.getItem(contextKey) || "";
  state.inventory = JSON.parse(localStorage.getItem(inventoryKey) || "[]");
  state.characters = JSON.parse(localStorage.getItem(charactersKey) || "[]");
  const hero = JSON.parse(localStorage.getItem(heroKey) || "{}");
  heroInputs.name.value = hero.name || "";
  heroInputs.class.value = hero.class || "";
  heroInputs.level.value = hero.level || 3;
  heroInputs.hp.value = hero.hp || 18;
  heroInputs.skill.value = hero.skill || "";
}

function saveState() {
  localStorage.setItem(contextKey, worldContext.value.trim());
  localStorage.setItem(inventoryKey, JSON.stringify(state.inventory));
  localStorage.setItem(charactersKey, JSON.stringify(state.characters));
}

function saveHero() {
  const hero = {
    name: heroInputs.name.value.trim(),
    class: heroInputs.class.value.trim(),
    level: heroInputs.level.value,
    hp: heroInputs.hp.value,
    skill: heroInputs.skill.value.trim(),
  };
  localStorage.setItem(heroKey, JSON.stringify(hero));
}

function renderList(list, target) {
  target.innerHTML = "";
  list.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${entry.title}</strong> <span>${entry.detail}</span>`;
    li.addEventListener("click", () => {
      list.splice(index, 1);
      saveState();
      renderAll();
    });
    target.appendChild(li);
  });
}

function renderChatBubble(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function generateMockResponse(prompt) {
  const context = worldContext.value.trim() || "Sans contexte enregistré";
  return `MJ IA ➜ Contexte actif: ${context}.\n\nVous proposez: "${prompt}".\n\nRéponse: La scène s'ouvre sur une tension palpable, un PNJ clé observe vos actions. Sélectionnez un jet ou ajoutez un élément d'inventaire pour continuer.`;
}

function renderAll() {
  renderList(state.inventory, inventoryList);
  renderList(state.characters, charactersList);
}

function initChat() {
  chatLog.innerHTML = "";
  introLines.forEach((line) => renderChatBubble(line, "ai"));
}

saveContextButton.addEventListener("click", () => {
  saveState();
  renderChatBubble("Contexte sauvegardé localement.", "ai");
});

document.getElementById("add-item").addEventListener("click", () => {
  const name = document.getElementById("item-name").value.trim();
  const detail = document.getElementById("item-detail").value.trim();
  if (!name) return;
  state.inventory.push({ title: name, detail: detail || "Objet" });
  saveState();
  renderAll();
  document.getElementById("item-name").value = "";
  document.getElementById("item-detail").value = "";
});

document.getElementById("add-character").addEventListener("click", () => {
  const name = document.getElementById("character-name").value.trim();
  const role = document.getElementById("character-role").value.trim();
  if (!name) return;
  state.characters.push({ title: name, detail: role || "PNJ" });
  saveState();
  renderAll();
  document.getElementById("character-name").value = "";
  document.getElementById("character-role").value = "";
});

document.getElementById("save-hero").addEventListener("click", () => {
  saveHero();
  renderChatBubble("Fiche de personnage mise à jour.", "ai");
});

document.getElementById("new-session").addEventListener("click", () => {
  localStorage.removeItem(contextKey);
  localStorage.removeItem(inventoryKey);
  localStorage.removeItem(charactersKey);
  localStorage.removeItem(heroKey);
  loadState();
  renderAll();
  initChat();
  renderChatBubble("Nouvelle session prête. Définissez votre univers.", "ai");
});

document.getElementById("export-session").addEventListener("click", () => {
  const payload = {
    context: worldContext.value.trim(),
    inventory: state.inventory,
    characters: state.characters,
    hero: JSON.parse(localStorage.getItem(heroKey) || "{}"),
  };
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  renderChatBubble("Contexte exporté dans le presse-papier.", "ai");
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();
  if (!prompt) return;
  renderChatBubble(prompt, "user");
  chatInput.value = "";
  renderChatBubble(generateMockResponse(prompt), "ai");
});

loadState();
renderAll();
initChat();
