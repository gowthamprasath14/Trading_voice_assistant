// ==========================================
// pageScript.js
// Runs in the PAGE context
// Creates the TradingView Horizontal Ray
// ==========================================

console.log("✅ Voice Horizontal Ray - Page Script Loaded");

// ------------------------------------------
// Listen for requests from frame.js
// ------------------------------------------

window.addEventListener("VOICE_HORIZONTAL_RAY", async (event) => {

    const price = Number(event.detail?.price);

    console.log("📩 Received price:", price);

    if (!Number.isFinite(price)) {
        console.error("❌ Invalid price:", event.detail?.price);
        return;
    }

    // --------------------------------------
    // Locate TradingView Widget
    // --------------------------------------

    const widget = window.tvWidget;

    console.log("🔎 tvWidget:", widget);

    if (!widget) {
        console.error("❌ tvWidget not found.");
        return;
    }

    if (typeof widget.activeChart !== "function") {
        console.error("❌ tvWidget.activeChart is not a function.");
        return;
    }

    console.log("✅ TradingView widget found.");

    // --------------------------------------
    // Get Active Chart
    // --------------------------------------

    try {

        const chart = widget.activeChart();

        console.log("📊 Active chart:", chart);

        if (!chart) {
            console.error("❌ Active chart not available.");
            return;
        }

        if (typeof chart.createShape !== "function") {
            console.error("❌ chart.createShape is not available.");
            return;
        }

        // ----------------------------------
        // Get Visible Chart Range
        // ----------------------------------

        const range = chart.getVisibleRange();

        console.log("📐 Visible range:", range);

        if (!range || range.from == null) {
            console.error("❌ Could not get chart visible range.");
            return;
        }

        // ----------------------------------
        // Create Horizontal Ray
        // ----------------------------------

        console.log("🎯 Creating ray at price:", price);

        const shapeId = await chart.createShape(
            {
                time: range.from,
                price: price
            },
            {
                shape: "horizontal_ray"
            }
        );

        console.log("=================================");
        console.log("✅ HORIZONTAL RAY CREATED");
        console.log("Price :", price);
        console.log("Shape :", shapeId);
        console.log("=================================");

    } catch (err) {

        console.error("❌ Failed to create Horizontal Ray");
        console.error(err);

    }

});
