

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


function time_str(date) {
    try {
        return date.toLocaleTimeString();
    }
    catch (e) { }
    try {
        return date.toTimeString();
    }
    catch (e) { }

    return `${date}`;
}


function renderLogs(messages, with_data=false, max_lines=4) {

    const html_lines = [];
    for (const message of messages) {
        let html = `<div class="message ${message.type}">`;
        html += `<div class="timestamp">${time_str(message.timestamp)}</div>`;
        html += `<div class="text">${message.text}</div>`;
        if (with_data && message.data)
            html += `<pre class="data">${JSON.stringify(message.data, null, 2)}</pre>`;
        html += `</div>`;
        html_lines.push(html);
    }

    let html = '';
    for (let i=html_lines.length-1, j=0; i>=0 && j<4; --i, ++j) {
        html += html_lines[i];
    }

    const container = document.querySelector(".log");
    container.innerHTML = html;
}