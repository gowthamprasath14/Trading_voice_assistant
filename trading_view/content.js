// ==========================================
// GROWW
// Inject pageScript.js into TradingView iframe
// ==========================================

function getGrowwTradingViewFrame() {

    const frames =
        document.querySelectorAll(
            'iframe[id^="tradingview_"]'
        );

    console.log(
        "🔎 TradingView frames found:",
        frames.length
    );

    for (const frame of frames) {

        console.log(
            "Frame:",
            frame,
            "SRC:",
            frame.src
        );

        if (
            frame.contentDocument &&
            frame.contentDocument.body
        ) {

            return frame;

        }

    }

    return null;
}


// ==========================================
// Inject pageScript.js
// ==========================================

function injectGrowwPageScript(frame) {

    if (!frame || !frame.contentDocument) {

        console.error(
            "❌ Cannot access Groww iframe document"
        );

        return false;
    }


    // Prevent duplicate injection

    if (
        frame.contentDocument.querySelector(
            "#voice-horizontal-ray-page-script"
        )
    ) {

        console.log(
            "✅ pageScript.js already injected"
        );

        return true;
    }


    const script =
        frame.contentDocument.createElement(
            "script"
        );


    script.id =
        "voice-horizontal-ray-page-script";


    script.src =
        chrome.runtime.getURL(
            "pageScript.js"
        );


    script.onload = () => {

        console.log(
            "✅ pageScript.js injected into Groww iframe"
        );

    };


    script.onerror = (error) => {

        console.error(
            "❌ Failed to inject pageScript.js",
            error
        );

    };


    (
        frame.contentDocument.head ||
        frame.contentDocument.documentElement
    ).appendChild(script);


    return true;
}


// ==========================================
// Send price to Groww TradingView
// ==========================================

function sendPriceToGroww(price) {

    const frame =
        getGrowwTradingViewFrame();


    if (!frame) {

        console.error(
            "❌ Groww TradingView iframe not found"
        );

        return false;
    }


    console.log(
        "✅ Groww TradingView iframe found"
    );


    const injected =
        injectGrowwPageScript(frame);


    if (!injected) {

        return false;

    }


    console.log(
        "📤 Sending price to Groww pageScript:",
        price
    );


    frame.contentWindow.dispatchEvent(

        new CustomEvent(
            "VOICE_HORIZONTAL_RAY",
            {
                detail: {
                    price: Number(price)
                }
            }
        )

    );


    return true;
}
