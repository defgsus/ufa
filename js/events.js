
const EXTENSION_URL = chrome.extension.getURL("");

const URL_MAPPING = {
    properties: {
        protocol: {"type": "keyword"},
        host: {"type": "keyword"},
        port: {"type": "integer"},
        path: {"type": "keyword"},
        hash: {"type": "keyword"},
        param: {"type": "keyword"},
    },
};

const TAG_MAPPING = {
    "properties": {
        "tag": {"type": "keyword"},
        "id": {"type": "keyword"},
        "class": {"type": "keyword"},
        "title": {"type": "keyword"},
        "text": {"type": "keyword"},
        "href": URL_MAPPING,
        "src": URL_MAPPING,
    }
};


class EventsBase {
    constructor(event_type) {
        this.event_type = event_type;
        this.events = [];
        this.num_collected = 0;
        this.num_exported = 0;
    }

    index_name() {
        return `browser-events-${this.event_type}`
    }

    add(event) {
        event = this.convert(event);
        console.log("EVENT", this.event_type, event.type, event);
        this.events.push(event);
        this.num_collected += 1;
    }

    mapping() {
        throw "Must implement this!";
    }

    convert(event) {
        return event;
    }

    drop(event) {
        return false;
    }

    validate(event) {
        const mapping = this.mapping().properties;

        const clean_event = {};
        for (const key of Object.keys(event)) {
            if (event[key] === undefined)
                continue;

            if (!mapping[key]) {
                log.warn(`Unmapped key '${key}' in '${this.event_type}' object`);
                continue
            }
            clean_event[key] = event[key];
        }

        return clean_event;
    }

    export(elastic_client) {
        const index_name = this.index_name();

        const events = this.events.map(event => (this.validate({
            ...event,
            event_type: this.event_type,
        })));

        return elastic_client
            .update_index(index_name, this.mapping())
            .then(() => {
                return elastic_client.export_documents(index_name, events);
            })
            .then(response => response.json())
            .then(response => {
                // console.log("BULK RESPONSE", response);

                const events_again = [];
                for (const i in response.items) {
                    const item = response.items[i];
                    const event = events[i];

                    if (!item.index.error) {
                        this.num_exported += 1;
                    } else {
                        events_again.push(event);
                        log.error(`event export '${event.event_type}': ${item.index.error.reason}`, item);
                    }
                }
                this.events = events_again;
                return response;
            })
            .catch(error => {
                log.catch_error("event export", error)
            });
    }
}


class Events {
    constructor() {
        this.events = {};
    }

    add_events(events) {
        this.events[events.event_type] = events;
    }

    add = (type, data) => {

        const events = this.events[type];
        if (!events)
            throw `Event type '${type}' not available`;

        if (events.drop(data)) {
            //console.log("DROPPED EVENT", type, data);
            return;
        }

        events.add(data);
    };

    statistics = () => {
        const stats = {};

        for (const event_type of Object.keys(this.events)) {
            const events = this.events[event_type];
            stats[event_type] = {
                num_collected: events.num_collected,
                num_exported: events.num_exported,
            };
        }

        return stats;
    };
    
    export = () => {
        const promises = [];

        for (const type of Object.keys(this.events)) {
            if (!this.events[type].events.length)
                continue;

            promises.push(this.events[type].export(elastic_client));
        }

        return Promise.all(promises);
    };

}
