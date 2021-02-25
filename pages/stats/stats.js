
let log_messages = [];
let latest_events = {};
let event_type_visible = {};

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
            case "event-data":
                store_latest_events(message.events);
                render_latest_events();
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

    function request_event_data() {
        chrome.runtime.sendMessage({type: "request-event-data"});
        setTimeout(request_event_data, 1000);
    }
    request_event_data();

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
    latest_events = {
        "mouse.wheel": {type: "wheel", "timestamp": "2000-01-01T00:00.000Z", "some": "more"},
        "keyboard.keydown": {type: "keydown", "timestamp": "2000-01-01T00:00.000Z", "some": "more"},
    };
    render_the_logs();
    render_latest_events();
}


function render_the_logs() {
    renderLogs(
        log_messages,
        document.querySelector("input.show-log-data").checked,
        100,
    );
}

function store_latest_events(events) {
    for (const event_type of Object.keys(events)) {
        if (events[event_type].events?.length) {
            for (const event of events[event_type].events) {
                const key = `${event_type}.${event.type}`;
                if (!latest_events[key] || event.timestamp > latest_events[key].timestamp) {
                    latest_events[key] = event;
                }
            }
        }
    }
}

function render_latest_events() {
    let html = ``;

    const event_types = Object.keys(latest_events);
    event_types.sort();

    for (const event_type of event_types) {
        const event = latest_events[event_type];
        const visible = !!event_type_visible[event_type];

        html += `<div class="event-type" data-et="${event_type}">`;
            html += `<input type="checkbox" data-et="${event_type}" ${visible ? "checked": ""}/>`;
            html += `<div class="title" data-et="${event_type}">${event_type}</div>`;
            html += `<div class="timestamp" data-et="${event_type}">${event.timestamp}</div>`;
        html += `</div>`;
        if (visible)
            html += `<pre>${JSON.stringify(event, null, 2)}</pre>`;
    }

    document.querySelector(".event-data").innerHTML = html;
    for (const elem of document.querySelectorAll("div.event-type, div.event-type input")) {
        elem.addEventListener("click", (e) => {
            const event_type = e.target.getAttribute("data-et");
            event_type_visible[event_type] = !event_type_visible[event_type];
            render_latest_events();
            e.stopPropagation();
        });
    }
}

