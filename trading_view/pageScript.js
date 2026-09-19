// ============================================================
// Voice Trigger Alarm
// pageScript.js
// App → Stock → Multiple Price Alerts
// ============================================================

console.log(
    "🚀 Voice Trigger Alarm - pageScript.js loaded"
);


// ============================================================
// STATE
// ============================================================

let widget = null;
let chart = null;
let priceCheckTimer = null;

// App → Stock → Alerts
//
// {
//     "Dhan": {
//         "RELIANCE": [
//             { id: "1", targetPrice: 3050 },
//             { id: "2", targetPrice: 3100 }
//         ],
//         "TCS": [
//             { id: "3", targetPrice: 4000 }
//         ]
//     }
// }

let priceAlerts = {};


// These are supplied by frame.js when an alert is sent.
// This is important because pageScript.js may be running
// inside the TradingView iframe.
let currentAppName = null;
let currentStockName = null;


// ============================================================
// GET APP NAME
// ============================================================

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


// ============================================================
// GET STOCK NAME
// ============================================================

function getStockName() {

    const title =
        document.title.trim();

    return title || "Unknown Stock";

}


// ============================================================
// CURRENT APP + STOCK
// ============================================================

function getCurrentGroup() {

    return {

        appName:
            currentAppName ||
            getAppName(),

        stockName:
            currentStockName ||
            getStockName()

    };

}


// ============================================================
// FIND TRADINGVIEW WIDGET
// ============================================================
//
// IMPORTANT:
// This uses the same approach that worked in your
// TradingView console.
//
// pageScript.js runs inside each iframe because
// frame.js is injected with all_frames: true.
//
// Therefore we search THIS window only.
// ============================================================

function findTradingViewWidget() {

    try {

        const objects =
            Object.values(window);

        for (const obj of objects) {

            try {

                if (
                    obj &&
                    typeof obj === "object" &&
                    typeof obj.activeChart === "function"
                ) {

                    console.log(
                        "✅ TradingView widget found:",
                        obj
                    );

                    return obj;

                }

            } catch (e) {

                // Some window properties may not
                // be accessible.

            }

        }

    } catch (error) {

        console.warn(
            "⚠️ Error while searching TradingView widget:",
            error
        );

    }

    return null;

}


// ============================================================
// GET TRADINGVIEW CHART
// ============================================================

function getTradingViewChart() {

    try {

        // Search for widget if we don't already have one.
        if (
            !widget ||
            typeof widget.activeChart !== "function"
        ) {

            widget =
                findTradingViewWidget();

        }


        // No widget yet.
        if (
            !widget
        ) {

            return null;

        }


        // Make sure activeChart exists.
        if (
            typeof widget.activeChart !== "function"
        ) {

            console.warn(
                "⚠️ Found object does not have activeChart()"
            );

            widget = null;
            chart = null;

            return null;

        }


        const activeChart =
            widget.activeChart();


        if (!activeChart) {

            console.warn(
                "⚠️ activeChart() returned null/undefined"
            );

            return null;

        }


        chart =
            activeChart;


        return chart;

    } catch (error) {

        console.warn(
            "⚠️ TradingView chart temporarily unavailable:",
            error
        );

        widget = null;
        chart = null;

        return null;

    }

}


// ============================================================
// FIND MAIN SERIES
// ============================================================

function findMainSeries() {

    const tvChart =
        getTradingViewChart();


    if (!tvChart) {

        return null;

    }


    // --------------------------------------------------------
    // Try getSeries()
    // --------------------------------------------------------

    try {

        if (
            typeof tvChart.getSeries === "function"
        ) {

            const series =
                tvChart.getSeries();


            if (
                Array.isArray(series) &&
                series.length > 0
            ) {

                return series[0];

            }

        }

    } catch (error) {

        console.log(
            "⚠️ getSeries() unavailable"
        );

    }


    // --------------------------------------------------------
    // Try getMainSeries()
    // --------------------------------------------------------

    try {

        if (
            typeof tvChart.getMainSeries === "function"
        ) {

            const mainSeries =
                tvChart.getMainSeries();


            if (mainSeries) {

                return mainSeries;

            }

        }

    } catch (error) {

        console.log(
            "⚠️ getMainSeries() unavailable"
        );

    }


    return null;

}


// ============================================================
// GET PRICE FROM SERIES
// ============================================================

function getPriceFromSeries(series) {

    if (!series) {

        return null;

    }


    // --------------------------------------------------------
    // getLastBar()
    // --------------------------------------------------------

    try {

        if (
            typeof series.getLastBar === "function"
        ) {

            const bar =
                series.getLastBar();


            if (bar) {

                const values = [

                    bar.close,
                    bar.price,
                    bar.last,
                    bar.value

                ];


                for (
                    const value of values
                ) {

                    const number =
                        Number(value);


                    if (
                        Number.isFinite(number)
                    ) {

                        return number;

                    }

                }

            }

        }

    } catch (error) {}



    // --------------------------------------------------------
    // getLastValue()
    // --------------------------------------------------------

    try {

        if (
            typeof series.getLastValue === "function"
        ) {

            const value =
                Number(
                    series.getLastValue()
                );


            if (
                Number.isFinite(value)
            ) {

                return value;

            }

        }

    } catch (error) {}



    // --------------------------------------------------------
    // getValue()
    // --------------------------------------------------------

    try {

        if (
            typeof series.getValue === "function"
        ) {

            const value =
                Number(
                    series.getValue()
                );


            if (
                Number.isFinite(value)
            ) {

                return value;

            }

        }

    } catch (error) {}


    return null;

}


// ============================================================
// GET LIVE PRICE
// ============================================================

function getLivePrice() {

    const tvChart =
        getTradingViewChart();


    if (!tvChart) {

        return null;

    }


    // --------------------------------------------------------
    // Try main series
    // --------------------------------------------------------

    const series =
        findMainSeries();


    const seriesPrice =
        getPriceFromSeries(series);


    if (
        Number.isFinite(seriesPrice)
    ) {

        return seriesPrice;

    }


    // --------------------------------------------------------
    // Try chart price methods
    // --------------------------------------------------------

    const methods = [

        "getLastPrice",
        "getCurrentPrice",
        "getPrice"

    ];


    for (
        const method of methods
    ) {

        try {

            if (
                typeof tvChart[method] !== "function"
            ) {

                continue;

            }


            const result =
                tvChart[method]();


            // Number result
            if (
                typeof result === "number" &&
                Number.isFinite(result)
            ) {

                return result;

            }


            // Object result
            if (
                result &&
                typeof result === "object"
            ) {

                const values = [

                    result.price,
                    result.last,
                    result.close,
                    result.value

                ];


                for (
                    const value of values
                ) {

                    const number =
                        Number(value);


                    if (
                        Number.isFinite(number)
                    ) {

                        return number;

                    }

                }

            }

        } catch (error) {}

    }


    return null;

}


// ============================================================
// SEND LIVE PRICE TO TOP PAGE
// ============================================================

function sendPriceUpdate(price) {

    try {

        const group =
            getCurrentGroup();


        window.top.postMessage(
            {

                type:
                    "VOICE_PRICE_ALERT_PRICE",

                appName:
                    group.appName,

                stockName:
                    group.stockName,

                price:
                    price

            },
            "*"
        );

    } catch (error) {}

}


// ============================================================
// SEND ALERT SET TO TOP PAGE
// ============================================================

function sendAlertSet(alert) {

    try {

        const group =
            getCurrentGroup();


        window.top.postMessage(
            {

                type:
                    "VOICE_PRICE_ALERT_SET",

                appName:
                    group.appName,

                stockName:
                    group.stockName,

                alertId:
                    alert.id,

                targetPrice:
                    alert.targetPrice

            },
            "*"
        );

    } catch (error) {}

}


// ============================================================
// SEND ALERT TRIGGERED
// ============================================================

function sendAlertTriggered(
    alertId,
    currentPrice,
    targetPrice
) {

    try {

        const group =
            getCurrentGroup();


        window.top.postMessage(
            {

                type:
                    "VOICE_PRICE_ALERT_TRIGGERED",

                appName:
                    group.appName,

                stockName:
                    group.stockName,

                alertId:
                    alertId,

                currentPrice:
                    currentPrice,

                targetPrice:
                    targetPrice

            },
            "*"
        );

    } catch (error) {}

}


// ============================================================
// SEND ALERT REMOVED
// ============================================================

function sendAlertRemoved(alertId) {

    try {

        const group =
            getCurrentGroup();


        window.top.postMessage(
            {

                type:
                    "VOICE_PRICE_ALERT_REMOVED",

                appName:
                    group.appName,

                stockName:
                    group.stockName,

                alertId:
                    alertId

            },
            "*"
        );

    } catch (error) {}

}


// ============================================================
// GET ALERTS FOR APP + STOCK
// ============================================================

function getCurrentAlerts() {

    const {
        appName,
        stockName
    } = getCurrentGroup();


    if (
        !priceAlerts[appName]
    ) {

        priceAlerts[appName] = {};

    }


    if (
        !priceAlerts[appName][stockName]
    ) {

        priceAlerts[appName][stockName] = [];

    }


    return (
        priceAlerts[appName][stockName]
    );

}


// ============================================================
// SET ALERT
// ============================================================

function setTargetPrice(
    alertId,
    targetPrice,
    appName,
    stockName
) {

    const price =
        Number(targetPrice);


    if (
        !alertId ||
        !Number.isFinite(price) ||
        price <= 0
    ) {

        console.warn(
            "⚠️ Invalid alert:",
            {
                alertId,
                targetPrice
            }
        );

        return;

    }


    // --------------------------------------------------------
    // IMPORTANT:
    // Use app/stock received from top page.
    // --------------------------------------------------------

    if (appName) {

        currentAppName =
            appName;

    }


    if (stockName) {

        currentStockName =
            stockName;

    }


    const group =
        getCurrentGroup();


    const alerts =
        getCurrentAlerts();


    // --------------------------------------------------------
    // Check if alert already exists
    // --------------------------------------------------------

    const existing =
        alerts.find(
            alert =>
                alert.id === alertId
        );


    if (existing) {

        existing.targetPrice =
            price;

    } else {

        alerts.push({

            id:
                alertId,

            targetPrice:
                price

        });

    }


    console.log(
        "🎯 Alert added:",
        {

            appName:
                group.appName,

            stockName:
                group.stockName,

            alertId:
                alertId,

            targetPrice:
                price

        }
    );


    console.log(
        "📋 Alerts for current stock:",
        alerts
    );


    sendAlertSet({

        id:
            alertId,

        targetPrice:
            price

    });


    startPriceMonitoring();

}


// ============================================================
// REMOVE ONE ALERT
// ============================================================

function removeTargetPrice(
    alertId,
    appName,
    stockName
) {

    if (!alertId) {

        return;

    }


    // --------------------------------------------------------
    // Use group supplied by top page.
    // --------------------------------------------------------

    if (appName) {

        currentAppName =
            appName;

    }


    if (stockName) {

        currentStockName =
            stockName;

    }


    const group =
        getCurrentGroup();


    const alerts =
        getCurrentAlerts();


    const oldLength =
        alerts.length;


    const remaining =
        alerts.filter(
            alert =>
                alert.id !== alertId
        );


    priceAlerts[group.appName][group.stockName] =
        remaining;


    if (
        remaining.length !== oldLength
    ) {

        console.log(
            "❌ Alert removed:",
            {

                appName:
                    group.appName,

                stockName:
                    group.stockName,

                alertId:
                    alertId

            }
        );


        sendAlertRemoved(
            alertId
        );

    }


    console.log(
        "📋 Remaining alerts:",
        remaining
    );

}


// ============================================================
// CHECK CURRENT STOCK PRICE
// ============================================================

function checkPrice(price) {

    if (
        !Number.isFinite(price)
    ) {

        return;

    }


    // Send live price to top content.js
    sendPriceUpdate(price);


    const {
        appName,
        stockName
    } = getCurrentGroup();


    const alerts =
        getCurrentAlerts();


    if (
        alerts.length === 0
    ) {

        return;

    }


    // --------------------------------------------------------
    // Find ALL alerts that have triggered
    // --------------------------------------------------------

    const triggered =
        alerts.filter(
            alert =>
                price >=
                alert.targetPrice
        );


    if (
        triggered.length === 0
    ) {

        return;

    }


    // --------------------------------------------------------
    // Remove ONLY triggered alerts
    // --------------------------------------------------------

    const triggeredIds =
        new Set(
            triggered.map(
                alert =>
                    alert.id
            )
        );


    priceAlerts[appName][stockName] =
        alerts.filter(
            alert =>
                !triggeredIds.has(
                    alert.id
                )
        );


    // --------------------------------------------------------
    // Send trigger for each alert
    // --------------------------------------------------------

    triggered.forEach(
        alert => {

            console.log(
                "🚨 ALERT TRIGGERED:",
                {

                    appName:
                        appName,

                    stockName:
                        stockName,

                    alertId:
                        alert.id,

                    target:
                        alert.targetPrice,

                    current:
                        price

                }
            );


            sendAlertTriggered(
                alert.id,
                price,
                alert.targetPrice
            );

        }
    );

}


// ============================================================
// START PRICE MONITORING
// ============================================================

function startPriceMonitoring() {

    if (
        priceCheckTimer
    ) {

        return;

    }


    console.log(
        "📈 Starting live price monitoring..."
    );


    // --------------------------------------------------------
    // Try immediate price
    // --------------------------------------------------------

    const immediatePrice =
        getLivePrice();


    if (
        Number.isFinite(
            immediatePrice
        )
    ) {

        console.log(
            "💰 Initial live price:",
            immediatePrice
        );


        checkPrice(
            immediatePrice
        );

    } else {

        console.log(
            "⏳ Live price not available yet"
        );

    }


    // --------------------------------------------------------
    // Monitor every 500 ms
    // --------------------------------------------------------

    priceCheckTimer =
        setInterval(
            () => {

                const price =
                    getLivePrice();


                if (
                    Number.isFinite(price)
                ) {

                    checkPrice(price);

                }

            },
            500
        );


}


// ============================================================
// STOP PRICE MONITORING
// ============================================================

function stopPriceMonitoring() {

    if (
        priceCheckTimer
    ) {

        clearInterval(
            priceCheckTimer
        );


        priceCheckTimer =
            null;


        console.log(
            "⏹️ Price monitoring stopped"
        );

    }

}


// ============================================================
// RECEIVE MESSAGES
// ============================================================

window.addEventListener(
    "message",
    event => {

        if (
            !event.data
        ) {

            return;

        }


        // ====================================================
        // SET PRICE ALERT
        // ====================================================

        if (
            event.data.type ===
            "SET_PRICE_ALERT"
        ) {

            console.log(
                "📩 SET_PRICE_ALERT received:",
                event.data
            );


            setTargetPrice(

                event.data.alertId,

                event.data.targetPrice,

                event.data.appName,

                event.data.stockName

            );

        }


        // ====================================================
        // REMOVE PRICE ALERT
        // ====================================================

        if (
            event.data.type ===
            "REMOVE_PRICE_ALERT"
        ) {

            console.log(
                "📩 REMOVE_PRICE_ALERT received:",
                event.data
            );


            removeTargetPrice(

                event.data.alertId,

                event.data.appName,

                event.data.stockName

            );

        }

    }
);


// ============================================================
// DEBUG OBJECT
// ============================================================

window.voicePriceAlert = {

    // --------------------------------------------------------
    // Add alert manually
    // --------------------------------------------------------

    setTarget(
        alertId,
        price,
        appName,
        stockName
    ) {

        const id =
            alertId ||
            Date.now().toString();


        setTargetPrice(

            id,

            price,

            appName,

            stockName

        );

    },


    // --------------------------------------------------------
    // Remove alert manually
    // --------------------------------------------------------

    removeTarget(
        alertId,
        appName,
        stockName
    ) {

        removeTargetPrice(

            alertId,

            appName,

            stockName

        );

    },


    // --------------------------------------------------------
    // Get live price
    // --------------------------------------------------------

    getPrice() {

        return getLivePrice();

    },


    // --------------------------------------------------------
    // Get ALL alerts
    // --------------------------------------------------------

    getAlerts() {

        return JSON.parse(
            JSON.stringify(
                priceAlerts
            )
        );

    },


    // --------------------------------------------------------
    // Get current App + Stock alerts
    // --------------------------------------------------------

    getCurrentAlerts() {

        const {
            appName,
            stockName
        } = getCurrentGroup();


        return {

            appName:
                appName,

            stockName:
                stockName,

            alerts:
                [
                    ...getCurrentAlerts()
                ]

        };

    },


    // --------------------------------------------------------
    // Get complete state
    // --------------------------------------------------------

    getState() {

        const {
            appName,
            stockName
        } = getCurrentGroup();


        return {

            appName:
                appName,

            stockName:
                stockName,

            livePrice:
                getLivePrice(),

            alerts:
                [
                    ...getCurrentAlerts()
                ],

            allAlerts:
                JSON.parse(
                    JSON.stringify(
                        priceAlerts
                    )
                )

        };

    },


    // --------------------------------------------------------
    // Force widget search
    // --------------------------------------------------------

    findWidget() {

        widget =
            findTradingViewWidget();


        return widget;

    },


    // --------------------------------------------------------
    // Get chart
    // --------------------------------------------------------

    getChart() {

        return getTradingViewChart();

    }

};


// ============================================================
// INITIALIZE
// ============================================================

function initialize() {

    console.log(
        "🔍 Searching for TradingView widget..."
    );


    const foundWidget =
        findTradingViewWidget();


    if (!foundWidget) {

        console.log(
            "⏳ TradingView widget not found in this frame"
        );

        return false;

    }


    widget =
        foundWidget;


    const foundChart =
        getTradingViewChart();


    if (!foundChart) {

        console.log(
            "⏳ Widget found, but chart is not ready yet"
        );


        widget =
            null;


        chart =
            null;


        return false;

    }


    chart =
        foundChart;


    console.log(
        "✅ TradingView chart found"
    );


    console.log(
        "📱 App:",
        getCurrentGroup().appName
    );


    console.log(
        "📊 Stock:",
        getCurrentGroup().stockName
    );


    startPriceMonitoring();


    return true;

}


// ============================================================
// INITIALIZATION RETRY
// ============================================================

setTimeout(
    initialize,
    1500
);


let initializationAttempts =
    0;


const initializationTimer =
    setInterval(
        () => {

            initializationAttempts++;


            console.log(
                `🔄 TradingView search attempt ${initializationAttempts}/20`
            );


            if (
                initialize() ||
                initializationAttempts >= 20
            ) {

                clearInterval(
                    initializationTimer
                );


                if (
                    initializationAttempts >= 20 &&
                    !widget
                ) {

                    console.warn(
                        "❌ TradingView widget could not be found after 20 attempts"
                    );

                }

            }

        },
        2000
    );