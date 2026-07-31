// ==========================================
// background.js
// Voice Horizontal Ray
// ==========================================

console.log("✅ Background Service Worker Started");

chrome.runtime.onMessage.addListener((message, sender) => {

    if (message.action !== "CREATE_HORIZONTAL_RAY")
        return;

    if (!sender.tab)
        return;

    console.log(
        "Received price:",
        message.price,
        "Tab:",
        sender.tab.id
    );

    chrome.tabs.sendMessage(
        sender.tab.id,
        {
            action: "CREATE_HORIZONTAL_RAY",
            price: message.price
        },
        () => {

            if (chrome.runtime.lastError) {

                console.warn(
                    "No frame received the message:",
                    chrome.runtime.lastError.message
                );

            }

        }
    );

});