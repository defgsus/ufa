
const DEFAULT_CONFIGURATION = {
    elasticsearch: {
        description: `<p>All data is passed to an <a href="https://www.elastic.co/guide/index.html">elasticsearch</a>`
                    + ` instance.</p>`,
        fields: {
            active: {type: "boolean"},
            hostname: {type: "string", value: "localhost:9200"},
            auto_export_interval: {type: "integer", name: "interval between exports", value: 60, unit: "seconds"},
        }
    },
    requests: {
        description: `<p>Collects all web requests from page loads and scripts and so on,`
            + ` no matter if they get blocked by a another extension.</p>`
            + ` <p>Own requests against elasticsearch are not recorded.</p>`,
        fields: {
            active: {type: "boolean"},
        }
    },
    mouse: {
        fields: {
            active: {type: "boolean"},
            click: {type: "boolean", name: "record clicks"},
            move: {type: "boolean", name: "record movement"},
            move_interval: {type: "integer", name: "record movement interval", value: 2, unit: "seconds"},
        }
    },
};


class Configuration {
    constructor() {
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIGURATION));
    }


}

// Live configuration accessible from background scripts
const configuration = new Configuration();

