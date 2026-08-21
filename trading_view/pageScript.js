// ==========================================
// pageScript.js
// Runs in PAGE context
// Finds TradingView widget and creates
// a Horizontal Ray at the spoken price
// ==========================================

console.log("✅ Voice Horizontal Ray - Page Script Loaded");


// ==========================================
// FIND TRADINGVIEW WIDGET
// ==========================================

function findTradingViewWidget() {

    // --------------------------------------
    // 1. Check current window
    // --------------------------------------

    try {

        for (const obj of Object.values(window)) {

            try {

                if (
                    obj &&
                    typeof obj === "object" &&
                    typeof obj.activeChart === "function"
                ) {

                    console.log("✅ TradingView widget found in current window");

                    return obj;

                }

            } catch (e) {}

        }

    } catch (e) {}



    // --------------------------------------
    // 2. Check child iframes
    // --------------------------------------

    const iframes = document.querySelectorAll("iframe");

    console.log("🔎 Checking", iframes.length, "iframe(s)...");


    for (const iframe of iframes) {

        try {

            const iframeWindow = iframe.contentWindow;

            if (!iframeWindow) {
                continue;
            }


            for (const obj of Object.values(iframeWindow)) {

                try {

                    if (
                        obj &&
                        typeof obj === "object" &&
                        typeof obj.activeChart === "function"
                    ) {

                        console.log(
                            "✅ TradingView widget found inside iframe"
                        );

                        return obj;

                    }

                } catch (e) {}

            }

        } catch (e) {

            console.log(
                "⚠️ Cannot access iframe:",
                e
            );

        }

    }


    // --------------------------------------
    // Widget not found
    // --------------------------------------

    console.error(
        "❌ TradingView widget not found"
    );

    return null;
}



// ==========================================
// CREATE HORIZONTAL RAY
// ==========================================

async function createHorizontalRay(price) {

    console.log(
        "🎯 Creating Horizontal Ray at:",
        price
    );


    // --------------------------------------
    // Validate price
    // --------------------------------------

    price = Number(price);

    if (!Number.isFinite(price)) {

        console.error(
            "❌ Invalid price:",
            price
        );

        return;

    }


    // --------------------------------------
    // Find TradingView widget
    // --------------------------------------

    const widget = findTradingViewWidget();

    if (!widget) {

        console.error(
            "❌ TradingView widget not found"
        );

        return;

    }


    try {

        // --------------------------------------
        // Get active chart
        // --------------------------------------

        const chart = widget.activeChart();

        if (!chart) {

            console.error(
                "❌ Active chart not found"
            );

            return;

        }


        console.log(
            "✅ Active chart found"
        );


        // --------------------------------------
        // Get visible chart range
        // --------------------------------------

        const range = chart.getVisibleRange();

        if (!range) {

            console.error(
                "❌ Could not get chart range"
            );

            return;

        }


        console.log(
            "📊 Chart range:",
            range
        );


        // --------------------------------------
        // Create Horizontal Ray
        // --------------------------------------

        const result = chart.createShape(

            {
                time: range.from,
                price: price
            },

            {
                shape: "horizontal_ray"
            }

        );


        // --------------------------------------
        // createShape() may return Promise
        // --------------------------------------

        if (
            result &&
            typeof result.then === "function"
        ) {

            const shapeId = await result;

            console.log(
                "================================="
            );

            console.log(
                "✅ Horizontal Ray Created"
            );

            console.log(
                "Price:",
                price
            );

            console.log(
                "Shape:",
                shapeId
            );

            console.log(
                "================================="
            );

        } else {

            console.log(
                "================================="
            );

            console.log(
                "✅ Horizontal Ray Created"
            );

            console.log(
                "Price:",
                price
            );

            console.log(
                "Shape:",
                result
            );

            console.log(
                "================================="
            );

        }

    }

    catch (err) {

        console.error(
            "❌ Failed to create Horizontal Ray"
        );

        console.error(err);

    }

}



// ==========================================
// RECEIVE PRICE FROM frame.js
// ==========================================

window.addEventListener(
    "VOICE_HORIZONTAL_RAY",
    (event) => {

        try {

            console.log(
                "📥 VOICE_HORIZONTAL_RAY event received"
            );

            const price = event.detail?.price;

            console.log(
                "Received price:",
                price
            );

            createHorizontalRay(price);

        }

        catch (err) {

            console.error(
                "❌ Error processing ray request:",
                err
            );

        }

    }
);



// ==========================================
// ALSO SUPPORT postMessage
// Useful for iframe/broker communication
// ==========================================

window.addEventListener(
    "message",
    (event) => {

        try {

            if (
                !event.data ||
                event.data.type !== "CREATE_HORIZONTAL_RAY"
            ) {

                return;

            }


            console.log(
                "📨 CREATE_HORIZONTAL_RAY message received"
            );


            const price = event.data.price;

            console.log(
                "Received price:",
                price
            );


            createHorizontalRay(price);

        }

        catch (err) {

            console.error(
                "❌ Message processing error:",
                err
            );

        }

    }
);
