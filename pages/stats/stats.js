
function connect_extension() {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "render-events":
                renderEvents(message.events);
                break;
            case "render-log":
                renderLogs(message.messages);
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
    ])
}



function renderEvents(events) {

    const keys = Object.keys(events);
    keys.sort();

    let html = ``;

    for (const key of keys) {
        const stats = events[key];
        html += `<div class="row">`;
        html += `<div class="cell-3">${key}</div>`;
        html += `<div class="cell-3">${stats.num_collected}</div>`;
        html += `<div class="cell-3">${stats.num_exported}</div>`;
        html += `<div class="cell-3">${stats.num_collected - stats.num_exported}</div>`;
        html += `</div>`;
    }
    html += ``;

    const container = document.querySelector(".statistics .events");
    container.innerHTML = html;
}


function renderLogs(messages) {

    const html_lines = [];
    for (const message of messages) {
        let html = `<div class="message ${message.type}">`;
        html += `<div class="timestamp">${message.timestamp.toLocaleTimeString()}</div>`;
        html += `<div class="text">${message.text}</div>`;
        if (message.data)
            html += `<pre class="data">${JSON.stringify(message.data, null, 2)}</pre>`;
        html += `</div>`;
        html_lines.push(html);
    }

    let html = '';
    for (let i=html_lines.length-1; i>=0; --i) {
        html += html_lines[i];
    }

    const container = document.querySelector(".log");
    container.innerHTML = html;
}