// ==========================================
// frame.js
// Runs inside TradingView iframe
// ==========================================

console.log("✅ frame.js loaded");

// ------------------------------------------
// Inject pageScript.js into PAGE context
// ------------------------------------------

const script = document.createElement("script");

script.src = chrome.runtime.getURL("pageScript.js");

script.onload = () => {

    console.log("✅ pageScript.js injected");

    script.remove();

    // ------------------------------------------
    // Listen for messages from background.js
    // ------------------------------------------

    chrome.runtime.onMessage.addListener((message) => {

        if (message.action !== "CREATE_HORIZONTAL_RAY")
            return;

        console.log("📩 frame.js received price:", message.price);

        // Forward to pageScript.js
        window.dispatchEvent(
            new CustomEvent("VOICE_HORIZONTAL_RAY", {
                detail: {
                    price: message.price
                }
            })
        );
    });

};

(document.head || document.documentElement).appendChild(script);