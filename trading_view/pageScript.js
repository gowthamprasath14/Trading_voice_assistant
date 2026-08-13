// ==========================================
// Voice Horizontal Ray
// pageScript.js
// Runs in Groww TradingView iframe MAIN WORLD
// ==========================================

console.log("🔥 Voice Horizontal Ray - pageScript.js LOADED");

window.addEventListener("VOICE_HORIZONTAL_RAY", async (event) => {

    console.log("📩 VOICE_HORIZONTAL_RAY received");

    const price = Number(event.detail?.price);

    console.log("💰 Price received:", price);

    if (!Number.isFinite(price)) {
        console.error("❌ Invalid price:", event.detail?.price);
        return;
    }

    // ==========================================
    // Groww TradingView API
    // ==========================================

    const tradingViewApi = window.tradingViewApi;

    console.log(
        "🔎 tradingViewApi:",
        tradingViewApi
    );

    if (!tradingViewApi) {

        console.error(
            "❌ tradingViewApi not found"
        );

        return;
    }

    if (
        typeof tradingViewApi.activeChart !==
        "function"
    ) {

        console.error(
            "❌ tradingViewApi.activeChart is not a function"
        );

        return;
    }

    try {

        // ======================================
        // Get active chart
        // ======================================

        const chart =
            tradingViewApi.activeChart();

        console.log(
            "📊 Active chart:",
            chart
        );


        if (!chart) {

            console.error(
                "❌ Active chart not available"
            );

            return;
        }


        if (
            typeof chart.createShape !==
            "function"
        ) {

            console.error(
                "❌ createShape() not available"
            );

            return;
        }


        // ======================================
        // Get visible range
        // ======================================

        const range =
            chart.getVisibleRange();

        console.log(
            "📐 Visible range:",
            range
        );


        if (
            !range ||
            range.from == null
        ) {

            console.error(
                "❌ Invalid visible range"
            );

            return;
        }


        // ======================================
        // Create ray
        // ======================================

        console.log(
            "🎯 Creating ray at:",
            price
        );


        const shapeId =
            await chart.createShape(

                {
                    time: range.from,
                    price: price
                },

                {
                    shape: "horizontal_ray"
                }

            );


        console.log(
            "================================="
        );

        console.log(
            "✅ GROWW HORIZONTAL RAY CREATED"
        );

        console.log(
            "💰 Price:",
            price
        );

        console.log(
            "🆔 Shape ID:",
            shapeId
        );

        console.log(
            "================================="
        );

    } catch (error) {

        console.error(
            "❌ Ray creation failed:",
            error
        );

    }

});
