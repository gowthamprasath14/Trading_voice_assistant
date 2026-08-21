// ==========================================
// frame.js
// Runs inside TradingView / broker iframe
// ==========================================

console.log("✅ frame.js loaded");


// ==========================================
// INJECT pageScript.js INTO PAGE CONTEXT
// ==========================================

function injectPageScript() {

    // Prevent duplicate injection
    if (document.querySelector(
        'script[data-voice-horizontal-ray="true"]'
    )) {
        console.log("⚠️ pageScript.js already injected");
        return;
    }


    const script = document.createElement("script");

    script.src = chrome.runtime.getURL("pageScript.js");

    script.dataset.voiceHorizontalRay = "true";


    script.onload = () => {

        console.log("✅ pageScript.js injected successfully");

        script.remove();

    };


    script.onerror = (err) => {

        console.error(
            "❌ Failed to inject pageScript.js",
            err
        );

    };


    (
        document.head ||
        document.documentElement
    ).appendChild(script);

}


// ==========================================
// INJECT SCRIPT
// ==========================================

injectPageScript();


// ==========================================
// RECEIVE MESSAGE FROM background.js
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            !message ||
            message.action !== "CREATE_HORIZONTAL_RAY"
        ) {
            return;
        }


        console.log(
            "📩 frame.js received price:",
            message.price
        );


        // --------------------------------------
        // Forward price to pageScript.js
        // --------------------------------------

        window.dispatchEvent(

            new CustomEvent(
                "VOICE_HORIZONTAL_RAY",
                {
                    detail: {
                        price: message.price
                    }
                }
            )

        );


        console.log(
            "📤 Price forwarded to pageScript.js:",
            message.price
        );

    }
);
