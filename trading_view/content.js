// ===============================================
// Voice Horizontal Ray
// content.js
// Part 1
// ===============================================

// Prevent duplicate loading
console.log("✅ content.js loaded");
const IS_TOP = window === window.top;

if (!IS_TOP) {
    console.log("Running inside iframe.");
    // Don't create the floating UI here.
} else if (document.getElementById("voice-horizontal-ray-root")) {

    console.log("Voice Horizontal Ray already loaded.");

} else {
    // ==========================================
    // Root
    // ==========================================

    const root = document.createElement("div");

    root.id = "voice-horizontal-ray-root";

    // ==========================================
    // Floating Mic
    // ==========================================

    const micButton = document.createElement("div");

    micButton.id = "vhr-mic-button";

    micButton.innerHTML = "🎤";

    // ==========================================
    // Panel
    // ==========================================

    const panel = document.createElement("div");

    panel.id = "vhr-panel";

    panel.innerHTML = `

        <div id="vhr-header">

            <span>🎤 Voice Horizontal Ray</span>

            <button id="vhr-close">✕</button>

        </div>

        <div class="vhr-section">

            <div id="vhr-status">

                Ready

            </div>

        </div>

        <div class="vhr-section">

            <button id="vhr-speak">

                🎤 Speak

            </button>

        </div>

        <div class="vhr-section">

            <label>

                Price

            </label>

            <input

                id="vhr-price"

                type="text"

                placeholder="Speak or type price"

            >

        </div>

        <div class="vhr-section">

            <button id="vhr-submit">

                Submit

            </button>

        </div>

    `;

    root.appendChild(micButton);

    root.appendChild(panel);

    document.body.appendChild(root);

    // ==========================================
    // DOM
    // ==========================================

    const status = document.getElementById("vhr-status");

    const priceBox = document.getElementById("vhr-price");

    const speakButton = document.getElementById("vhr-speak");

    const submitButton = document.getElementById("vhr-submit");

    const closeButton = document.getElementById("vhr-close");

    // ==========================================
    // Open / Close
    // ==========================================

    function openPanel(){

        panel.classList.add("open");

    }

    function closePanel(){

        panel.classList.remove("open");

    }

    micButton.addEventListener("click",openPanel);

    closeButton.addEventListener("click",closePanel);

    // ==========================================
    // PART 2 BELOW
    // ==========================================
    // ==========================================
// PART 2
// Speech Recognition
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (!SpeechRecognition) {

    status.textContent = "Speech Recognition Not Supported";

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        status.textContent = "🎤 Listening...";

        speakButton.disabled = true;

    };

    recognition.onspeechstart = () => {

        status.textContent = "Speaking...";

    };

    recognition.onspeechend = () => {

        status.textContent = "Processing...";

    };

    recognition.onresult = (event) => {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript += event.results[i][0].transcript;

        }

        transcript = transcript.trim();

        priceBox.value = transcript;

        status.textContent = "Speech Recognized";

    };

    recognition.onerror = (event) => {

        console.error(event);

        switch (event.error) {

            case "no-speech":
                status.textContent = "No speech detected";
                break;

            case "audio-capture":
                status.textContent = "Microphone not found";
                break;

            case "not-allowed":
                status.textContent = "Microphone permission denied";
                break;

            default:
                status.textContent =
                    "Error : " + event.error;

        }

        speakButton.disabled = false;

    };

    recognition.onend = () => {

        speakButton.disabled = false;

        if (
            status.textContent === "Processing..."
        ) {

            status.textContent = "Ready";

        }

    };

    speakButton.addEventListener("click", () => {

        status.textContent = "Starting...";

        recognition.start();

    });

}
// ==========================================
// PART 3
// Submit Button
// ==========================================

submitButton.addEventListener("click", () => {

    let text = priceBox.value.trim();

    if (text === "") {

        alert("Please enter or speak a price.");

        return;

    }

    let price;

    // Already numeric
    if (!isNaN(text)) {

        price = parseFloat(text);

    }

    // Convert words to number
    else {

        if (typeof convertSpeechToPrice === "function") {

            price = convertSpeechToPrice(text);

        }
        else {

            alert("Price parser not loaded.");

            return;

        }

    }

    if (price === null || isNaN(price)) {

        alert("Invalid price.");

        return;

    }

    console.log("Price:", price);

    status.textContent = "Sending...";

    // Send the price to pageScript.js
chrome.runtime.sendMessage(
    {
        action: "CREATE_HORIZONTAL_RAY",
        price: price
    },
    () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            status.textContent = "Extension Error";
            return;
        }

        status.textContent = "Waiting for TradingView...";
    }
);
    

});
}