// ==========================================
// Voice Trigger Alarm
// frame.js
// Runs inside TradingView / broker iframe
// ==========================================

console.log("✅ Voice Trigger Alarm - frame.js loaded");


// ==========================================
// INJECT pageScript.js INTO PAGE CONTEXT
// ==========================================

function injectPageScript() {

    // Prevent duplicate injection
    if (
        document.querySelector(
            'script[data-voice-price-alert="true"]'
        )
    ) {

        console.log(
            "⚠️ Voice Price Alert pageScript.js already injected"
        );

        return;
    }


    const script =
        document.createElement("script");


    script.src =
        chrome.runtime.getURL("pageScript.js");


    // IMPORTANT:
    // This ID is different from the Horizontal Ray extension
    script.dataset.voicePriceAlert = "true";


    script.onload = () => {

        console.log(
            "✅ Voice Price Alert pageScript.js injected successfully"
        );

        script.remove();

    };


    script.onerror = (err) => {

        console.error(
            "❌ Failed to inject Voice Price Alert pageScript.js",
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
// RECEIVE SET ALERT FROM background.js
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            !message ||
            message.action !== "SET_PRICE_ALERT"
        ) {

            return;
        }


        console.log(
            "📩 Voice Price Alert received:",
            message
        );


        // ======================================
        // Forward complete alert information
        // to pageScript.js
        // ======================================

        window.postMessage(
            {
                type: "SET_PRICE_ALERT",

                alertId:
                    message.alertId,

                targetPrice:
                    Number(message.targetPrice),

                appName:
                    message.appName,

                stockName:
                    message.stockName
            },
            "*"
        );


        console.log(
            "📤 Target forwarded to Price Alert pageScript:",
            {
                alertId: message.alertId,
                targetPrice: message.targetPrice,
                appName: message.appName,
                stockName: message.stockName
            }
        );

    }
);


// ==========================================
// RECEIVE REMOVE ALERT FROM background.js
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            !message ||
            message.action !== "REMOVE_PRICE_ALERT"
        ) {

            return;
        }


        console.log(
            "📩 Remove Price Alert received:",
            message
        );


        // ======================================
        // Forward complete remove information
        // ======================================

        window.postMessage(
            {
                type: "REMOVE_PRICE_ALERT",

                alertId:
                    message.alertId,

                appName:
                    message.appName,

                stockName:
                    message.stockName
            },
            "*"
        );


        console.log(
            "📤 Remove command forwarded:",
            {
                alertId: message.alertId,
                appName: message.appName,
                stockName: message.stockName
            }
        );

    }
);