
let log_messages = [];


function connect_extension() {

    document.querySelector("input.show-log-data").addEventListener("click", () => {
        render_the_logs();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "render-events":
                renderEvents(message.events);
                break;
            case "render-log":
                log_messages = message.messages;
                render_the_logs();
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
    log_messages = [
        {type: "log", text: "Some message", data: {"hello": "world"}, timestamp: new Date()},
        {type: "warn", text: "There is no data", timestamp: new Date()},
        {type: "error", text: "Very important", data: {"error": 23}, timestamp: new Date()},
    ];
    render_the_logs();
}


function render_the_logs() {
    renderLogs(log_messages, document.querySelector("input.show-log-data").checked);
}