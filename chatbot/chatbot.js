document.addEventListener("DOMContentLoaded", function () {

const API_KEY = "";

/* -----------------------------
   SESSION MEMORY (lightweight)
------------------------------*/
let sessionContext = {
  occasion: null,
  vibe: null,
  service: null
};

/* -----------------------------
   MAIN FUNCTION
------------------------------*/
async function sendMessage(){

    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chat-box");

    const userMessage = input.value.trim();
    if(!userMessage) return;

    renderMessage("user", userMessage);
    input.value = "";

    showTyping();

    const prompt = buildStylistPrompt(userMessage);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            })
        }
    );

    const data = await response.json();

    removeTyping();

    const botReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text
        || "I couldn't style your request properly.";

    renderMessage("bot", botReply);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* -----------------------------
   STYLE ENGINE PROMPT
------------------------------*/
function buildStylistPrompt(userMessage){

    updateContext(userMessage);

    return `
You are "Velour Occasion Stylist AI".

You are NOT a normal chatbot.

You behave like a luxury salon stylist in Mumbai.

GOAL:
Help users decide:
- hairstyle
- salon service
- look for an occasion
- booking suggestion

STYLE RULES:
- Be concise
- Be opinionated (do NOT be generic)
- Always guide toward an occasion-based decision
- Ask follow-up questions when needed
- Speak like a premium stylist, not an AI assistant

CURRENT CONTEXT:
Occasion: ${sessionContext.occasion || "unknown"}
Vibe: ${sessionContext.vibe || "unknown"}
Service: ${sessionContext.service || "unknown"}

USER MESSAGE:
${userMessage}

OUTPUT FORMAT:
- First: direct stylist answer
- Then: 1 follow-up question only
- If unsure: suggest 2–3 options max (never more)
`;
}

/* -----------------------------
   CONTEXT EXTRACTION (simple brain)
------------------------------*/
function updateContext(text){

    const t = text.toLowerCase();

    if(t.includes("wedding")) sessionContext.occasion = "wedding";
    if(t.includes("party")) sessionContext.occasion = "party";
    if(t.includes("date")) sessionContext.occasion = "date night";
    if(t.includes("office") || t.includes("work")) sessionContext.occasion = "formal";

    if(t.includes("hair") || t.includes("cut")) sessionContext.service = "haircut";
    if(t.includes("color")) sessionContext.service = "hair coloring";
    if(t.includes("spa")) sessionContext.service = "spa";

    if(t.includes("glam")) sessionContext.vibe = "glamorous";
    if(t.includes("simple")) sessionContext.vibe = "minimal";
    if(t.includes("luxury")) sessionContext.vibe = "luxury";
}

/* -----------------------------
   UI RENDER HELPERS
------------------------------*/
function renderMessage(type, text){
    const chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div class="${type}">
            <strong>${type === "user" ? "You" : "Velour"}:</strong> ${text}
        </div>
    `;
}

/* -----------------------------
   TYPING EFFECT
------------------------------*/
function showTyping(){
    const chatBox = document.getElementById("chat-box");

    const typing = document.createElement("div");
    typing.className = "bot";
    typing.id = "typing";
    typing.innerHTML = "<em>Velour is styling your look...</em>";

    chatBox.appendChild(typing);
}

function removeTyping(){
    const typing = document.getElementById("typing");
    if(typing) typing.remove();
}

});