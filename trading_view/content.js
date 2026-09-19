// ============================================================
// Voice Trigger Alarm
// content.js
// App → Stock → Multiple Persistent Price Alerts
// ============================================================

console.log("✅ Voice Trigger Alarm - content.js loaded");

const IS_TOP = window === window.top;

// ============================================================
// ONLY CREATE UI IN TOP PAGE
// ============================================================

if (!IS_TOP) {

    console.log(
        "📄 Running inside iframe - UI not created."
    );

} else if (
    document.getElementById("voice-price-alert-root")
) {

    console.log(
        "Voice Trigger Alarm already loaded."
    );

} else {

    // ========================================================
    // APP NAME
    // ========================================================

    function getAppName() {

        const hostname =
            location.hostname.toLowerCase();

        const parts =
            hostname.split(".");

        let appName = hostname;

        if (parts.length >= 2) {
            appName =
                parts[parts.length - 2];
        }

        return (
            appName.charAt(0).toUpperCase() +
            appName.slice(1)
        );
    }

    // ========================================================
    // STOCK / CHART NAME
    // ========================================================

    function getStockName() {

    const title = document.title;

    return title || "Unknown Stock";


    }

    // ========================================================
    // CURRENT APP + STOCK
    // ========================================================

    function getCurrentGroup() {

        return {
            appName:
                getAppName(),

            stockName:
                getStockName()
        };

    }

    console.log(
        "📱 App:",
        getAppName()
    );

    console.log(
        "📊 Stock:",
        getStockName()
    );

    // ========================================================
    // STORAGE
    // ========================================================

    const STORAGE_KEY =
        "voicePriceAlerts";

    /*
        Storage structure:

        {
            "Dhan": {

                "RELIANCE": [

                    {
                        id: "123",
                        targetPrice: 3050
                    },

                    {
                        id: "456",
                        targetPrice: 3100
                    }

                ],

                "TCS": [

                    {
                        id: "789",
                        targetPrice: 4000
                    }

                ]

            },

            "Zerodha": {

                "RELIANCE": [

                    {
                        id: "999",
                        targetPrice: 3050
                    }

                ]

            }

        }
    */

    let allAlerts = {};

    // ========================================================
    // ROOT
    // ========================================================

    const root =
        document.createElement("div");

    root.id =
        "voice-price-alert-root";

    // ========================================================
    // WARNING BUTTON
    // ========================================================

    const warningButton =
        document.createElement("div");

    warningButton.id =
        "vpa-warning-button";

    warningButton.innerHTML =
        "⚠️";

    // ========================================================
    // PANEL
    // ========================================================

    const panel =
        document.createElement("div");

    panel.id =
        "vpa-panel";

    panel.innerHTML = `

        <div id="vpa-header">

            <span>
                Voice Trigger Alarm
            </span>

            <button id="vpa-close">
                ✕
            </button>

        </div>

        <div class="vpa-section">

            <div id="vpa-status">
                Ready
            </div>

        </div>

        <div class="vpa-section">

            <button id="vpa-speak">
                🎤 Speak Target Price
            </button>

        </div>

        <div class="vpa-section">

            <label>
                Target Price
            </label>

            <input
                id="vpa-price"
                type="text"
                placeholder="Speak or type price"
            >

        </div>

        <div class="vpa-section">

            <button id="vpa-submit">
                🔔 Set Alert
            </button>

        </div>

        <div id="vpa-alert-list"></div>

    `;

    root.appendChild(
        warningButton
    );

    root.appendChild(
        panel
    );

    document.body.appendChild(
        root
    );

    // ========================================================
    // DOM
    // ========================================================

    const status =
        document.getElementById(
            "vpa-status"
        );

    const priceBox =
        document.getElementById(
            "vpa-price"
        );

    const speakButton =
        document.getElementById(
            "vpa-speak"
        );

    const submitButton =
        document.getElementById(
            "vpa-submit"
        );

    const closeButton =
        document.getElementById(
            "vpa-close"
        );

    const alertList =
        document.getElementById(
            "vpa-alert-list"
        );

    // ========================================================
    // OPEN / CLOSE
    // ========================================================

    warningButton.addEventListener(
        "click",
        () => {
            panel.classList.add("open");
        }
    );

    closeButton.addEventListener(
        "click",
        () => {
            panel.classList.remove("open");
        }
    );

    // ========================================================
    // GENERATE ALERT ID
    // ========================================================

    function generateAlertId() {

        return (
            Date.now().toString() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }

    // ========================================================
    // GET CURRENT STOCK ALERTS
    // ========================================================

    function getCurrentAlerts() {

        const {
            appName,
            stockName
        } = getCurrentGroup();

        if (
            !allAlerts[appName]
        ) {

            allAlerts[appName] = {};

        }

        if (
            !allAlerts[appName][stockName]
        ) {

            allAlerts[appName][stockName] = [];

        }

        return (
            allAlerts[appName][stockName]
        );

    }

    // ========================================================
    // SAVE EVERYTHING
    // ========================================================

    async function saveAlerts() {

        try {

            await chrome.storage.local.set({

                [STORAGE_KEY]:
                    allAlerts

            });

            console.log(
                "💾 All alerts saved:",
                allAlerts
            );

        } catch (error) {

            console.error(
                "❌ Failed to save alerts:",
                error
            );

        }

    }

    // ========================================================
    // LOAD EVERYTHING
    // ========================================================

    async function loadAlerts() {

        try {

            const result =
                await chrome.storage.local.get(
                    STORAGE_KEY
                );

            if (
                result &&
                result[STORAGE_KEY] &&
                typeof result[STORAGE_KEY] ===
                    "object"
            ) {

                allAlerts =
                    result[STORAGE_KEY];

            } else {

                allAlerts = {};

            }

            console.log(
                "💾 Restored all alerts:",
                allAlerts
            );

            renderAlerts();

            restoreCurrentStockAlerts();

        } catch (error) {

            console.error(
                "❌ Failed to load alerts:",
                error
            );

        }

    }

    // ========================================================
    // RENDER CURRENT STOCK ALERTS
    // ========================================================

    function renderAlerts() {

        alertList.innerHTML = "";

        const {
            appName,
            stockName
        } = getCurrentGroup();

        const alerts =
            getCurrentAlerts();

        // ----------------------------------------------------
        // CURRENT STOCK HEADER
        // ----------------------------------------------------

        const stockHeader =
            document.createElement("div");

        stockHeader.className =
            "vpa-alert-list-title";

        stockHeader.textContent =
            `🟡 ${appName} → ${stockName}`;

        alertList.appendChild(
            stockHeader
        );

        // ----------------------------------------------------
        // NO ALERTS
        // ----------------------------------------------------

        if (
            alerts.length === 0
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "vpa-no-alerts";

            empty.textContent =
                "No active alerts";

            alertList.appendChild(
                empty
            );

            status.textContent =
                "Ready";

            return;

        }

        // ----------------------------------------------------
        // ALERT ROWS
        // ----------------------------------------------------

        alerts.forEach(
            alert => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "vpa-alert-row";

                row.dataset.alertId =
                    alert.id;

                const price =
                    document.createElement(
                        "span"
                    );

                price.className =
                    "vpa-alert-row-price";

                price.textContent =
                    "₹" +
                    alert.targetPrice;

                const remove =
                    document.createElement(
                        "button"
                    );

                remove.className =
                    "vpa-alert-row-remove";

                remove.textContent =
                    "Remove";

                remove.addEventListener(
                    "click",
                    () => {

                        removeAlert(
                            alert.id
                        );

                    }
                );

                row.appendChild(
                    price
                );

                row.appendChild(
                    remove
                );

                alertList.appendChild(
                    row
                );

            }
        );

        status.textContent =
            alerts.length +
            (
                alerts.length === 1
                    ? " alert active"
                    : " alerts active"
            );

    }

    // ========================================================
    // SEND ALERT TO TRADINGVIEW
    // ========================================================

    function sendAlertToTradingView(
        alert
    ) {

        const {
            appName,
            stockName
        } = getCurrentGroup();

        console.log(
            "📤 Sending alert to TradingView:",
            {
                appName,
                stockName,
                alert
            }
        );

        chrome.runtime.sendMessage({

            action:
                "SET_PRICE_ALERT",

            alertId:
                alert.id,

            targetPrice:
                alert.targetPrice,

            appName:
                appName,

            stockName:
                stockName

        });

    }

    // ========================================================
    // RESTORE CURRENT STOCK ALERTS
    // ========================================================

    function restoreCurrentStockAlerts() {

        const alerts =
            getCurrentAlerts();

        if (
            alerts.length === 0
        ) {

            return;

        }

        console.log(
            "🔄 Restoring alerts for:",
            getCurrentGroup(),
            alerts
        );

        let attempt = 0;

        function sendAll() {

            attempt++;

            console.log(
                "🔄 Restore attempt:",
                attempt
            );

            const currentAlerts =
                getCurrentAlerts();

            currentAlerts.forEach(
                alert => {

                    sendAlertToTradingView(
                        alert
                    );

                }
            );

            if (
                attempt < 10
            ) {

                setTimeout(
                    sendAll,
                    1500
                );

            }

        }

        setTimeout(
            sendAll,
            1500
        );

    }

    // ========================================================
    // REMOVE ONE ALERT
    // ========================================================

    async function removeAlert(
        alertId
    ) {

        const {
            appName,
            stockName
        } = getCurrentGroup();

        console.log(
            "❌ Removing alert:",
            {
                appName,
                stockName,
                alertId
            }
        );

        if (
            allAlerts[appName] &&
            allAlerts[appName][stockName]
        ) {

            allAlerts[appName][stockName] =
                allAlerts[appName][stockName]
                    .filter(
                        alert =>
                            alert.id !==
                            alertId
                    );

        }

        await saveAlerts();

        renderAlerts();

        chrome.runtime.sendMessage({

            action:
                "REMOVE_PRICE_ALERT",

            alertId:
                alertId,

            appName:
                appName,

            stockName:
                stockName

        });

    }

    // ========================================================
    // SPEECH RECOGNITION
    // ========================================================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;

    if (
        !SpeechRecognition
    ) {

        status.textContent =
            "Speech Recognition Not Supported";

    } else {

        recognition =
            new SpeechRecognition();

        recognition.lang =
            "en-US";

        recognition.continuous =
            false;

        recognition.interimResults =
            true;

        recognition.maxAlternatives =
            1;

        recognition.onstart =
            () => {

                status.textContent =
                    "🎤 Listening...";

                speakButton.disabled =
                    true;

            };

        recognition.onspeechstart =
            () => {

                status.textContent =
                    "🗣️ Speaking...";

            };

        recognition.onspeechend =
            () => {

                status.textContent =
                    "Processing...";

            };

        recognition.onresult =
            event => {

                let transcript = "";

                for (
                    let i =
                        event.resultIndex;

                    i <
                    event.results.length;

                    i++
                ) {

                    transcript +=
                        event.results[i][0]
                            .transcript;

                }

                transcript =
                    transcript.trim();

                if (
                    transcript !== ""
                ) {

                    priceBox.value =
                        transcript;

                    status.textContent =
                        "✅ Speech Recognized";

                    console.log(
                        "🎤 Speech:",
                        transcript
                    );

                }

            };

        recognition.onerror =
            event => {

                console.error(
                    "Speech recognition error:",
                    event
                );

                switch (
                    event.error
                ) {

                    case "no-speech":

                        status.textContent =
                            "⚠️ No speech detected";

                        break;

                    case "audio-capture":

                        status.textContent =
                            "❌ Microphone not found";

                        break;

                    case "not-allowed":

                        status.textContent =
                            "❌ Microphone permission denied";

                        break;

                    default:

                        status.textContent =
                            "❌ Error: " +
                            event.error;

                }

                speakButton.disabled =
                    false;

            };

        recognition.onend =
            () => {

                speakButton.disabled =
                    false;

                if (
                    status.textContent ===
                    "Processing..."
                ) {

                    status.textContent =
                        "Ready";

                }

            };

        speakButton.addEventListener(
            "click",
            () => {

                if (!recognition)
                    return;

                status.textContent =
                    "Starting...";

                try {

                    recognition.start();

                } catch (error) {

                    console.warn(
                        "Recognition start error:",
                        error
                    );

                }

            }
        );

    }

    // ========================================================
    // CONVERT PRICE
    // ========================================================

    function convertPrice(text) {

        text =
            text.trim();

        // ----------------------------------------------------
        // Direct number
        // ----------------------------------------------------

        if (
            text !== "" &&
            !isNaN(text)
        ) {

            const number =
                parseFloat(text);

            if (
                Number.isFinite(number)
            ) {

                return number;

            }

        }

        // ----------------------------------------------------
        // Existing parser
        // ----------------------------------------------------

        if (
            typeof convertSpeechToPrice ===
            "function"
        ) {

            try {

                const price =
                    convertSpeechToPrice(
                        text
                    );

                if (
                    price !== null &&
                    Number.isFinite(
                        Number(price)
                    )
                ) {

                    return Number(price);

                }

            } catch (error) {

                console.error(
                    "Price parser error:",
                    error
                );

            }

        }

        // ----------------------------------------------------
        // Fallback
        // ----------------------------------------------------

        const numberMatch =
            text.match(
                /\d+(?:\.\d+)?/
            );

        if (
            numberMatch
        ) {

            const number =
                parseFloat(
                    numberMatch[0]
                );

            if (
                Number.isFinite(number)
            ) {

                return number;

            }

        }

        return null;

    }

    // ========================================================
    // SET NEW ALERT
    // ========================================================

    submitButton.addEventListener(
        "click",
        async () => {

            const text =
                priceBox.value.trim();

            if (
                text === ""
            ) {

                alert(
                    "Please speak or enter a target price."
                );

                return;

            }

            const price =
                convertPrice(text);

            if (
                price === null ||
                !Number.isFinite(price) ||
                price <= 0
            ) {

                alert(
                    "Invalid target price."
                );

                return;

            }

            const {
                appName,
                stockName
            } = getCurrentGroup();

            const alerts =
                getCurrentAlerts();

            // ------------------------------------------------
            // PREVENT DUPLICATES FOR THIS STOCK ONLY
            // ------------------------------------------------

            const alreadyExists =
                alerts.some(
                    alert =>
                        Number(
                            alert.targetPrice
                        ) ===
                        Number(price)
                );

            if (
                alreadyExists
            ) {

                alert(
                    "This target price is already active for this stock."
                );

                return;

            }

            // ------------------------------------------------
            // CREATE ALERT
            // ------------------------------------------------

            const alertObject = {

                id:
                    generateAlertId(),

                targetPrice:
                    price

            };

            alerts.push(
                alertObject
            );

            await saveAlerts();

            renderAlerts();

            console.log(
                "🎯 New alert:",
                {
                    appName,
                    stockName,
                    alert:
                        alertObject
                }
            );

            status.textContent =
                "📡 Setting alert...";

            // ------------------------------------------------
            // SEND TO TRADINGVIEW
            // ------------------------------------------------

            sendAlertToTradingView(
                alertObject
            );

            priceBox.value = "";

            setTimeout(
                () => {

                    const currentAlerts =
                        getCurrentAlerts();

                    status.textContent =
                        currentAlerts.length +
                        (
                            currentAlerts.length === 1
                                ? " alert active"
                                : " alerts active"
                        );

                },
                500
            );

        }
    );

    // ========================================================
    // RECEIVE EVENTS FROM pageScript.js
    // ========================================================

    window.addEventListener(
        "message",
        async event => {

            try {

                if (
                    !event.data
                ) {

                    return;

                }

                // ============================================
                // TARGET SET
                // ============================================

                if (
                    event.data.type ===
                    "VOICE_PRICE_ALERT_SET"
                ) {

                    console.log(
                        "🟡 Alert confirmed:",
                        event.data
                    );

                    renderAlerts();

                }

                // ============================================
                // LIVE PRICE
                // ============================================

                if (
                    event.data.type ===
                    "VOICE_PRICE_ALERT_PRICE"
                ) {

                    console.log(
                        "📈 Live price:",
                        event.data.price
                    );

                }

                // ============================================
                // TRIGGERED
                // ============================================

if (
    event.data.type ===
    "VOICE_PRICE_ALERT_TRIGGERED"
) {

    const alertId =
        event.data.alertId;

    const currentPrice =
        event.data.currentPrice;

    const targetPrice =
        event.data.targetPrice;

    const appName =
        event.data.appName ||
        getAppName();

    const stockName =
        event.data.stockName ||
        getStockName();

    console.log(
        "🚨 PRICE ALERT TRIGGERED:",
        {
            appName,
            stockName,
            alertId,
            currentPrice,
            targetPrice
        }
    );

    // ==========================================
    // PLAY LOCAL ALERT SOUND
    // ==========================================

    try {

        const alarm =
            new Audio(
                chrome.runtime.getURL("audio.mp3")
            );

        alarm.volume = 1.0;

        alarm.play()
            .then(() => {
                console.log(
                    "🔊 Alert sound played"
                );
            })
            .catch(error => {
                console.error(
                    "❌ Could not play alert sound:",
                    error
                );
            });

    } catch (error) {

        console.error(
            "❌ Audio error:",
            error
        );

    }

    // ==========================================
    // VOICE ANNOUNCEMENT
    // ==========================================

    const voice =
        new SpeechSynthesisUtterance(
            `Alert! ${stockName} price has reached ${targetPrice}`
        );

    speechSynthesis.speak(voice);

}



                    // ----------------------------------------
                    // REMOVE ONLY THIS ALERT
                    // ----------------------------------------

                    if (
                        allAlerts[appName] &&
                        allAlerts[appName][stockName]
                    ) {

                        allAlerts[appName][stockName] =
                            allAlerts[appName][stockName]
                                .filter(
                                    alert =>
                                        alert.id !==
                                        alertId
                                );

                    }

                    // SAVE IMMEDIATELY
                    await saveAlerts();

                    renderAlerts();

                    // ----------------------------------------
                    // ONLINE ALARM
                    // ----------------------------------------

                    

alertAlarm = new Audio(
    chrome.runtime.getURL("audio.mp3")
);

alertAlarm.volume = 1.0;

alertAlarm.play()
    .then(() => {
        console.log("🔊 Local alarm playing for 5 seconds");

        setTimeout(() => {

            if (alertAlarm) {

                alertAlarm.pause();
                alertAlarm.currentTime = 0;
                alertAlarm = null;

                console.log(
                    "🔇 Alarm automatically stopped after 5 seconds"
                );
            }

        }, 5000);
    })
    .catch(error => {
        console.error(
            "❌ Alarm failed:",
            error
        );
    });

                    // ----------------------------------------
                    // VOICE ANNOUNCEMENT
                    // ----------------------------------------

                    const voice =
                        new SpeechSynthesisUtterance(
                            `Alert! ${stockName} price has reached ${targetPrice}`
                        );

                    voice.rate = 1;
                    voice.volume = 1;

                    speechSynthesis.cancel();

                    speechSynthesis.speak(
                        voice
                    );

                    // ----------------------------------------
                    // CUSTOM NOTIFICATION
                    // ----------------------------------------

                    showCustomNotification(
                        appName,
                        stockName,
                        currentPrice,
                        targetPrice
                    );

                
            

                // ============================================
                // ALERT REMOVED
                // ============================================

                if (
                    event.data.type ===
                    "VOICE_PRICE_ALERT_REMOVED"
                ) {

                    const alertId =
                        event.data.alertId;

                    const appName =
                        event.data.appName ||
                        getAppName();

                    const stockName =
                        event.data.stockName ||
                        getStockName();

                    console.log(
                        "❌ Alert removed:",
                        {
                            appName,
                            stockName,
                            alertId
                        }
                    );

                    if (
                        allAlerts[appName] &&
                        allAlerts[appName][stockName]
                    ) {

                        allAlerts[appName][stockName] =
                            allAlerts[appName][stockName]
                                .filter(
                                    alert =>
                                        alert.id !==
                                        alertId
                                );

                    }

                    await saveAlerts();

                    renderAlerts();

                }

            } catch (error) {

                console.error(
                    "❌ Message handling error:",
                    error
                );

            }

        }
    );

    // ========================================================
    // CUSTOM NOTIFICATION
    // ========================================================

    function showCustomNotification(
        appName,
        stockName,
        currentPrice,
        targetPrice
    ) {

        const oldNotification =
            document.getElementById(
                "vpa-custom-notification"
            );

        if (
            oldNotification
        ) {

            oldNotification.remove();

        }

        const notification =
            document.createElement("div");

        notification.id =
            "vpa-custom-notification";

        notification.innerHTML = `

            <div class="vpa-notification-header">

                <span>
                    🔔 PRICE ALERT
                </span>

                <button
                    id="vpa-notification-close"
                >
                    ✕
                </button>

            </div>

            <div class="vpa-notification-app">
                ${appName}
            </div>

            <div class="vpa-notification-stock">
                ${stockName}
            </div>

            <div class="vpa-notification-price">
                ₹${currentPrice}
            </div>

            <div class="vpa-notification-target">
                Target reached: ₹${targetPrice}
            </div>

        `;

        document.body.appendChild(
            notification
        );

        const close =
            document.getElementById(
                "vpa-notification-close"
            );

        if (
            close
        ) {

            close.onclick =
                () => {

                    notification.remove();

                };

        }

    }

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    status.textContent =
        "Ready";

    loadAlerts();

}