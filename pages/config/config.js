

class Configurator {

    constructor() {
        // create a 2nd Configuration instance that holds the local changes
        this.local_config = new Configuration();
        this.local_config.load_storage()
            .then(() => {
                this.render_config(this.local_config.config);
            })
            .catch(() => {
                // fallback mode - probably just loading the html file for design reasons
                console.log("config NOT LOADED from storage!");
                this.render_config(DEFAULT_CONFIGURATION);
            });

        this.hook_dom();
    }

    hook_dom() {
        this.on_input_change = this.on_input_change.bind(this);

        document.querySelector("button.save").addEventListener("click", () => {
            this.local_config.save_storage()
                .then(() => {
                    chrome.runtime.sendMessage({
                        type: "config-changed"
                    });
                });
        });

        document.querySelector("button.revert").addEventListener("click", () => {
            this.local_config.load_storage()
                .then(() => {
                    this.render_config(this.local_config.config);
                });
        });

        document.querySelector("button.reset").addEventListener("click", () => {
            this.local_config.set_config(DEFAULT_CONFIGURATION);
            this.local_config.save_storage();
            this.render_config(this.local_config.config);
            chrome.runtime.sendMessage({
                type: "config-changed"
            });
        });

        document.querySelector("button.show-storage").addEventListener("click", () => {
            chrome.storage.local.get(["config"], (data) => {
                document.querySelector("pre.debug").innerText = JSON.stringify(data["config"], null, 2);
            });
        });
    }

    on_input_change(e) {
        const elem = e.target;
        // console.log("INPUT", elem);
        const config_key = elem.getAttribute("data-id").split(".");
        const field = this.local_config.config[config_key[0]].fields[config_key[1]];
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

        field.value = value;
    };

    render_config(config) {
        let html = ``;
        for (const section_key of Object.keys(config)) {
            const section = config[section_key];
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
                if (field.type === "boolean")
                    html += this.render_input(section_key, field_key, field);
                html += `<div class="name">${field_name}</div>`;
                if (field.type !== "boolean")
                    html += this.render_input(section_key, field_key, field);
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
            elem.addEventListener("input", this.on_input_change);
    }

    render_input(section_key, field_key, field) {
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

        //if (field.type === "boolean") {
            html = `<div class="value checkbox-wrapper">${html}</div>`;
        //}

        return html;
    }

}


const configurator = new Configurator();
