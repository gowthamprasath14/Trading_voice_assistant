// ===============================================
// Voice Horizontal Ray
// content.js
// ===============================================

console.log("✅ content.js loaded");

const IS_TOP = window === window.top;

// ===============================================
// Don't create UI inside iframes
// ===============================================

if (!IS_TOP) {

    console.log("Running inside iframe.");

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

    function openPanel() {

        panel.classList.add("open");

    }


    function closePanel() {

        panel.classList.remove("open");

    }


    micButton.addEventListener("click", openPanel);

    closeButton.addEventListener("click", closePanel);


    // ==========================================
    // PART 2
    // Speech Recognition
    // ==========================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    let recognition = null;


    if (!SpeechRecognition) {

        status.textContent =
            "Speech Recognition Not Supported";

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

                transcript +=
                    event.results[i][0].transcript;

            }


            transcript = transcript.trim();

            priceBox.value = transcript;

            status.textContent =
                "Speech Recognized";

            console.log(
                "🎤 Speech:",
                transcript
            );

        };


        recognition.onerror = (event) => {

            console.error(
                "❌ Speech recognition error:",
                event
            );


            switch (event.error) {

                case "no-speech":

                    status.textContent =
                        "No speech detected";

                    break;


                case "audio-capture":

                    status.textContent =
                        "Microphone not found";

                    break;


                case "not-allowed":

                    status.textContent =
                        "Microphone permission denied";

                    break;


                default:

                    status.textContent =
                        "Error : " +
                        event.error;

            }


            speakButton.disabled = false;

        };


        recognition.onend = () => {

            speakButton.disabled = false;


            if (
                status.textContent ===
                "Processing..."
            ) {

                status.textContent = "Ready";

            }

        };


        speakButton.addEventListener(
            "click",
            () => {

                status.textContent =
                    "Starting...";


                try {

                    recognition.start();

                } catch (error) {

                    console.error(
                        "❌ Recognition start error:",
                        error
                    );

                }

            }
        );

    }


    // ==========================================
    // PART 3
    // Groww TradingView Ray
    // ==========================================

    async function createGrowwRay(price) {

        console.log(
            "🎯 Creating Groww ray at:",
            price
        );


        // Find Groww TradingView iframe

        const frame =
            document.querySelector(
                'iframe[id^="tradingview_"]'
            );


        if (!frame) {

            console.error(
                "❌ Groww TradingView iframe not found"
            );

            status.textContent =
                "TradingView chart not found";

            return false;

        }


        console.log(
            "✅ TradingView iframe found:",
            frame
        );


        // Get iframe window

        const w = frame.contentWindow;


        if (!w) {

            console.error(
                "❌ Cannot access iframe window"
            );

            status.textContent =
                "Cannot access chart";

            return false;

        }


        // Groww exposes TradingView API as tradingViewApi

        const tradingViewApi =
            w.tradingViewApi;


        if (!tradingViewApi) {

            console.error(
                "❌ tradingViewApi not found"
            );

            status.textContent =
                "TradingView API not ready";

            return false;

        }


        console.log(
            "✅ tradingViewApi found:",
            tradingViewApi
        );


        // Get active chart

        let chart;


        try {

            chart =
                tradingViewApi.activeChart();

        } catch (error) {

            console.error(
                "❌ activeChart() failed:",
                error
            );

            status.textContent =
                "Chart not ready";

            return false;

        }


        if (!chart) {

            console.error(
                "❌ Active chart not found"
            );

            status.textContent =
                "Active chart not found";

            return false;

        }


        console.log(
            "✅ Active chart found:",
            chart
        );


        // Check createShape

        if (
            typeof chart.createShape !==
            "function"
        ) {

            console.error(
                "❌ chart.createShape is not available"
            );

            status.textContent =
                "Ray API unavailable";

            return false;

        }


        // Get visible range

        let range;


        try {

            range =
                chart.getVisibleRange();

        } catch (error) {

            console.error(
                "❌ getVisibleRange() failed:",
                error
            );

            status.textContent =
                "Chart range unavailable";

            return false;

        }


        if (
            !range ||
            range.from == null
        ) {

            console.error(
                "❌ Invalid visible range:",
                range
            );

            status.textContent =
                "Chart range unavailable";

            return false;

        }


        console.log(
            "📐 Visible range:",
            range
        );


        // ======================================
        // Create Horizontal Ray
        // ======================================

        try {

            status.textContent =
                "Creating ray...";


            const shapeId =
                await chart.createShape(

                    {
                        time: range.from,
                        price: Number(price)
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
                "Price:",
                price
            );

            console.log(
                "Shape ID:",
                shapeId
            );

            console.log(
                "================================="
            );


            status.textContent =
                "✅ Ray created at " +
                price;


            return true;

        } catch (error) {

            console.error(
                "❌ Failed to create Groww ray:",
                error
            );

            status.textContent =
                "❌ Failed to create ray";

            return false;

        }

    }


    // ==========================================
    // PART 4
    // Submit Button
    // ==========================================

    submitButton.addEventListener(
        "click",
        async () => {

            let text =
                priceBox.value.trim();


            // Empty input

            if (text === "") {

                alert(
                    "Please enter or speak a price."
                );

                return;

            }


            let price;


            // ======================================
            // Already numeric
            // ======================================

            if (!isNaN(text)) {

                price =
                    parseFloat(text);

            }


            // ======================================
            // Convert spoken words to number
            // ======================================

            else {

                if (
                    typeof convertSpeechToPrice ===
                    "function"
                ) {

                    price =
                        convertSpeechToPrice(text);

                } else {

                    alert(
                        "Price parser not loaded."
                    );

                    return;

                }

            }


            // ======================================
            // Validate price
            // ======================================

            if (
                price === null ||
                price === undefined ||
                isNaN(price)
            ) {

                alert(
                    "Invalid price."
                );

                return;

            }


            price =
                Number(price);


            console.log(
                "💰 Price:",
                price
            );


            // ======================================
            // Detect Groww
            // ======================================

            const isGroww =
                location.hostname
                    .toLowerCase()
                    .includes("groww.in");


            if (isGroww) {

                console.log(
                    "🟢 Groww detected"
                );


                const success =
                    await createGrowwRay(
                        price
                    );


                if (success) {

                    console.log(
                        "🎯 Groww ray completed"
                    );

                }


                return;

            }


            // ======================================
            // Other brokers
            // ======================================

            status.textContent =
                "Sending...";


            console.log(
                "📤 Sending price to existing ray system:",
                price
            );


            chrome.runtime.sendMessage({

                action:
                    "CREATE_HORIZONTAL_RAY",

                price:
                    price

            });


            status.textContent =
                "Waiting for TradingView...";

        }

    );

}
