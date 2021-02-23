
function connect_extension() {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "render-events":
                renderEvents(message.events);
                break;
            case "render-log":
                renderLogs(message.messages, true);
                break;
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

    function request_update() {
        chrome.runtime.sendMessage({type: "popup-opened"});
        setTimeout(request_update, 1000);
    }

    request_update();
}

try {
    connect_extension();
}
catch (e) {
    renderLogs([
        {type: "log", text: "Some message", data: {"hello": "world"}, timestamp: new Date()},
        {type: "warn", text: "There is no data", timestamp: new Date()},
        {type: "error", text: "Very important", data: {"error": 23}, timestamp: new Date()},
    ], true);
}
