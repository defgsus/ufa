
function request_update() {
    chrome.runtime.sendMessage({type: "popup-opened"});
    setTimeout(request_update, 1000);
}

request_update();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "render-events": renderEvents(message.events); break;
        case "render-log": renderLogs(message.messages); break;
    }
});


document.querySelector("button.export").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "export",
    });
});

document.querySelector("button.config").addEventListener("click", () => {
    chrome.tabs.create({
        url: "/pages/config/config.html",
    });
});

document.querySelector("button.stats").addEventListener("click", () => {
    chrome.tabs.create({
        url: "/pages/stats/stats.html",
    });
});


