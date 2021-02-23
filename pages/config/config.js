
let local_configuration = null;


try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "config-render":
                local_configuration = message.configuration;
                render_config(local_configuration);
                break
        }
    });

    chrome.runtime.sendMessage({
        type: "config-opened",
    });
}
catch (e) {

}

document.querySelector("button.save").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "config-saved",
        configuration: local_configuration,
    });
});

document.querySelector("button.revert").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "config-opened",
    });
});

document.querySelector("button.reset").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "config-reset",
    });
});


function on_input_change(e) {
    const elem = e.target;
    // console.log("INPUT", elem);
    const config_key = elem.getAttribute("data-id").split(".");
    const field = local_configuration[config_key[0]].fields[config_key[1]];
    // console.log(field);

    let value;
    switch (field.type) {
        case "boolean":
            value = elem.checked;
            break;
        case "integer":
            value = parseInt(elem.value);
            break;
        default:
            value = elem.value;
    }

    local_configuration[config_key[0]].fields[config_key[1]].value = value;
}




function render_config(configuration) {
    let html = ``;
    for (const section_key of Object.keys(configuration)) {
        const section = configuration[section_key];
        const section_name = section.name || section_key;

        html += `<div class="section">`;
            html += `<div class="title">${section_name}</div>`;
            if (section.description) {
                html += `<div class="description">${section.description}</div>`;
            }
            for (const field_key of Object.keys(section.fields)) {
                const field = section.fields[field_key];
                const field_name = field.name || field_key;

                html += `<div class="field">`;
                    html += `<div class="name">${field_name}</div>`;
                    html += render_input(section_key, field_key, field);
                    if (field.unit)
                        html += ` ${field.unit}`;
                    if (field.description)
                        html += `<div class="description">${field.description}</div>`;
                html += `</div>`;
            }

        html += `</div>`;
    }

    document.querySelector(".config").innerHTML = html;
    for (const elem of document.querySelectorAll("input.value"))
        elem.addEventListener("input", on_input_change);
}


function render_input(section_key, field_key, field) {
    let type = "text";
    switch (field.type) {
        case "boolean": type = "checkbox"; break;
        case "integer": type = "number"; break;
    }

    let html = `<input class="value" type="${type}"`;
    if (field.type === "boolean") {
        if (field.value)
            html += ` checked="checked"`;
    }
    else
        html += ` value="${field.value}"`;
    html += ` data-id="${section_key}.${field_key}" />`;

    return html;
}


//render_config(configuration);

