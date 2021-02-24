class EventsMouse extends EventsBase {
    constructor() {
        super("mouse");
    }

    mapping() {
        return {
            properties: {
                event_type: {"type": "keyword"},

                alt_key: {"type": "integer"},
                button: {"type": "integer"},
                ctrl_key: {"type": "integer"},
                client_x: {"type": "integer"},
                client_y: {"type": "integer"},
                input_source: {"type": "keyword"},
                is_trusted: {"type": "boolean"},
                layer_x: {"type": "integer"},
                layer_y: {"type": "integer"},
                meta_key: {"type": "integer"},
                movement_x: {"type": "integer"},
                movement_y: {"type": "integer"},
                movement: {"type": "integer"},
                offset_x: {"type": "integer"},
                offset_y: {"type": "integer"},
                page_x: {"type": "integer"},
                page_y: {"type": "integer"},
                pressure: {"type": "float"},
                region: {"type": "keyword"},
                screen_x: {"type": "integer"},
                screen_y: {"type": "integer"},
                shift_key: {"type": "integer"},
                tab_id: {"type": "integer"},
                tab_active: {"type": "integer"},
                tab_title: {"type": "keyword"},
                tab_url: URL_MAPPING,
                target: TAG_MAPPING,
                timestamp: {"type": "date"},
                type: {"type": "keyword"},
                wheel: {"type": "float"},
                wheel_x: {"type": "float"},
                wheel_y: {"type": "float"},
                wheel_z: {"type": "float"},
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


class MouseCollector {

    constructor(events, tabs) {
        this.events = events;
        this.tabs = tabs;
    }

    add = (event, tab) => {
        if (configuration.get(`mouse.${event.type}`)) {
            this.events.add("mouse", {
                ...event,
                tab,
            });
        }
    };

}
