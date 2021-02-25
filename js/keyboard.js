
class EventsKeyboard extends EventsBase {
    constructor() {
        super("keyboard");
    }

    mapping() {
        return {
            properties: {
                event_type: {"type": "keyword"},

                alt_key: {"type": "integer"},
                code: {"type": "keyword"},
                ctrl_key: {"type": "integer"},
                duration: {"type": "integer"},
                key: {"type": "keyword"},
                is_trusted: {"type": "boolean"},
                meta_key: {"type": "integer"},
                shift_key: {"type": "integer"},
                tab_id: {"type": "integer"},
                tab_active: {"type": "integer"},
                tab_title: {"type": "keyword"},
                tab_url: URL_MAPPING,
                target: TAG_MAPPING,
                timestamp: {"type": "date"},
                timestamp_released: {"type": "date"},
                type: {"type": "keyword"},
            }
        };
    }

    convert(event) {
        if (event.tab) {
            event = {
                ...event,
                tab: undefined,
                ...minimal_tab_data(event.tab)
            }
        }
        return event;
    }

}


class KeyboardCollector {

    constructor(events, tabs) {
        this.events = events;
        this.tabs = tabs;
    }

    add(event, tab) {
        if (configuration.get("keyboard.active")) {

            const extra_data = configuration.get("keyboard.include_key")
                ? null
                : {key: undefined, key_code: undefined};

            this.events.add("keyboard", {
                ...event,
                ...extra_data,
                tab,
            });
        }
    };

}
