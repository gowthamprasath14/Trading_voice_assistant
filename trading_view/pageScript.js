// ==========================================
// pageScript.js
// Runs in the PAGE context
// Creates the TradingView Horizontal Ray
// ==========================================

console.log("✅ Voice Horizontal Ray - Page Script Loaded");

// Listen for requests from frame.js
window.addEventListener("VOICE_HORIZONTAL_RAY", (event) => {

    const price = Number(event.detail.price);

    console.log("Received price:", price);

    if (isNaN(price)) {

        console.error("❌ Invalid price.");

        return;

    }

    // --------------------------------------
    // Locate TradingView Widget
    // --------------------------------------

    let widget = null;

    for (const obj of Object.values(window)) {

        try {

            if (
                obj &&
                typeof obj === "object" &&
                typeof obj.activeChart === "function"
            ) {

                widget = obj;

                break;

            }

        }
        catch (e) {}

    }

    if (!widget) {

        console.error("❌ TradingView widget not found.");

        return;

    }

    console.log("✅ TradingView widget found.");

    // --------------------------------------
    // Create Horizontal Ray
    // --------------------------------------

    try {

        const chart = widget.activeChart();

        const range = chart.getVisibleRange();

        const shapeId = chart.createShape(

            {
                time: range.from,
                price: price
            },

            {
                shape: "horizontal_ray"
            }

        );

        console.log("=================================");
        console.log("✅ Horizontal Ray Created");
        console.log("Price :", price);
        console.log("Shape :", shapeId);
        console.log("=================================");

    }
    catch (err) {

        console.error("❌ Failed to create Horizontal Ray");

        console.error(err);

    }

});