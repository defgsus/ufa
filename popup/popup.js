
function request_update() {
    chrome.runtime.sendMessage({type: "popup-opened"});
    setTimeout(request_update, 1000);
}

request_update();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "popup-render-events": renderEvents(message.events);
    }
});


document.querySelector("button.export").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "export",
    });
});

function renderEvents(events) {

    let html = '<div class="events">';

    html += `<div class="row">`;
    html += `<div class="cell-3">event type</div>`;
    html += `<div class="cell-3">collected</div>`;
    html += `<div class="cell-3">exported</div>`;
    html += `<div class="cell-3">pending</div>`;
    html += `</div>`;

    const keys = Object.keys(events.num_collected);
    keys.sort();

    for (const key of keys) {
        html += `<div class="row">`;
        html += `<div class="cell-3">${key}</div>`;
        html += `<div class="cell-3">${events.num_collected[key]}</div>`;
        html += `<div class="cell-3">${events.num_exported[key] || 0}</div>`;
        html += `<div class="cell-3">${events.num_collected[key] - (events.num_exported[key] || 0)}</div>`;
        html += `</div>`;
    }
    html += `</div>`;

    const container = document.querySelector(".statistics");
    container.innerHTML = html;
}