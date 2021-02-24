
const DEFAULT_CONFIGURATION = {
    elasticsearch: {
        description: `<p>All data is passed to an <a href="https://www.elastic.co/guide/index.html">elasticsearch</a>`
                    + ` instance.</p>`,
        fields: {
            active: {
                type: "boolean",
                description: `When enabled all collected events are regularly exported.`
            },
            hostname: {
                type: "string",
                value: "localhost:9200"
            },
            export_interval: {
                type: "integer",
                name: "interval between exports",
                value: 60, unit: "seconds"
            },
        }
    },
    requests: {
        description: `<p>Collects all web requests from page loads and scripts and so on,`
            + ` no matter if they get blocked by a another extension.</p>`
            + ` <p>Own requests against elasticsearch are not recorded.</p>`,
        fields: {
            active: {
                type: "boolean"
            },
            headers: {
                type: "boolean",
                name: "include headers",
                description: `Includes the header values. Be careful because this can leak credentials.`
            },
            header_name_pattern: {
                type: "string",
                name: "header names",
                description: `A regular expression to limit the exported headers.`,
                value: "user-agent",
            }
        }
    },
    tabs: {
        description: `<p>Records anything about your tabs like opening, closing, changing and activity time.</p>`,
        fields: {
            active: {
                type: "boolean"
            },
        }
    },
    mouse: {
        fields: {
            click: {
                type: "boolean",
                name: "record clicks"
            },
            move: {
                type: "boolean",
                name: "record movement",
                description: `Accumulates mouse movements and collects them in a fixed time interval.`
            },
            move_interval: {
                type: "integer",
                name: "record movement interval",
                value: 2, unit: "seconds"
            },
        }
    },
    keyboard: {
        description: `<p>Yes, this one records your keyboard events!`
                    + `The duration in milliseconds is also included.`
                    + ` You can omit the actual pressed key`
                    + ` if that makes you feel more <em>private</em>.</p>`,
        fields: {
            active: {
                type: "boolean",
            },
            include_key: {
                type: "boolean",
                name: "include pressed key",
                description: `Will include the <em>key</em> and <em>code</em> fields of keyboard events.`
            },
        }
    },
    debug: {
        description: `<p>Development stuff that clutters the UI</p>`,
        fields: {
            log_log: {
                type: "boolean",
                name: "Log normal messages",
            },
            log_debug: {
                type: "boolean",
                name: "Log debugging messages",
            },
            log_event: {
                type: "boolean",
                name: "Log collected events",
            }
        }
    }
};


class Configuration {
    constructor() {
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIGURATION));
    }

    get_config() {
        return JSON.parse(JSON.stringify(this.config));
    }

    set_config(config) {
        this.config = JSON.parse(JSON.stringify(config));
    }

    get(section_field) {
        const sf = section_field.split(".");
        try {
            return this.config[sf[0]].fields[sf[1]].value;
        }
        catch (e) {
            throw `No config value '${section_field}'`;
        }
    }

    set(section_field, value) {
        const sf = section_field.split(".");
        this.config[sf[0]].fields[sf[1]].value = value;
    }

    save_storage() {
        return new Promise((resolve, reject) => {
                const data = {};
                for (const section_key of Object.keys(this.config)) {
                    const section = this.config[section_key];
                    data[section_key] = {};
                    for (const field_key of Object.keys(section.fields)) {
                        const field = section.fields[field_key];
                        data[section_key][field_key] = field.value;
                    }
                }
                chrome.storage.local.set({"config": data}, resolve);
            });
    }

    load_storage() {
        return new Promise((resolve, reject) => {
                chrome.storage.local.get(["config"], resolve);
            })
            .then(data => {
                if (data?.config) {
                    data = data.config;
                    for (const section_key of Object.keys(data)) {
                        const section = data[section_key];
                        for (const field_key of Object.keys(section)) {
                            if (this.config[section_key]?.fields[field_key])
                                this.config[section_key].fields[field_key].value = section[field_key];
                        }
                    }
                    return data;
                }
            });
    }
}

// Live configuration accessible from background scripts
const configuration = new Configuration();
