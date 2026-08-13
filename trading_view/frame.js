// ==========================================
// frame.js
// Runs inside TradingView / broker frames
// Bridges extension messages to pageScript.js
// ==========================================

console.log("✅ Voice Horizontal Ray - frame.js loaded");


// ==========================================
// Inject pageScript.js into PAGE context
// ==========================================

const script = document.createElement("script");

script.src = chrome.runtime.getURL("pageScript.js");

script.onload = () => {

    console.log("✅ pageScript.js injected successfully");

    // Remove script tag after execution
    script.remove();

};


// Handle injection errors
script.onerror = () => {

    console.error("❌ Failed to inject pageScript.js");

};


// Inject into the current frame
(document.head || document.documentElement).appendChild(script);


// ==========================================
// Receive message from background.js
// ==========================================

chrome.runtime.onMessage.addListener((message) => {

    if (!message || message.action !== "CREATE_HORIZONTAL_RAY") {
        return;
    }

    console.log("📩 frame.js received ray request");

    console.log("💰 Price received:", message.price);


    // ======================================
    // Send price to pageScript.js
    // ======================================

    window.dispatchEvent(
        new CustomEvent("VOICE_HORIZONTAL_RAY", {
            detail: {
                price: message.price
            }
        })
    );

    console.log("📤 Ray request sent to pageScript.js");

});
