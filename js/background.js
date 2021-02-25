"use strict";


class Background {

    constructor() {
        this.events = new Events();
        this.events.add_events(new EventsMouse());
        this.events.add_events(new EventsRequest());
        this.events.add_events(new EventsTab());
        this.events.add_events(new EventsKeyboard());

        this.tabs_collector = new TabsCollector(this.events);
        this.request_collector = new RequestCollector(this.events, this.tabs_collector);
        this.mouse_collector = new MouseCollector(this.events, this.tabs_collector);
        this.keyboard_collector = new KeyboardCollector(this.events, this.tabs_collector);
        this.hook();
        this.on_config_changed();
    }

    hook() {
        this.export_timer = null;
        this.export_events_periodic = this.export_events_periodic.bind(this);

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            //console.log("BACKGROUND on-message", message);
            switch (message.type) {

                case "popup-opened":
                    this.update_popup_view();
                    break;

                case "request-event-data":
                    this.send_event_data();
                    break;

                case "config-changed":
                    this.on_config_changed();
                    break;

                case "content-mouse":
                    this.mouse_collector.add(message.event, sender.tab);
                    break;

                case "content-key":
                    this.keyboard_collector.add(message.event, sender.tab);
                    break;

                case "export":
                    this.events.export()
                        .then(this.update_popup_view)
                        .catch(this.update_popup_view);
                    break;

            }

            //sendResponse();
        });
    };

    on_config_changed() {
        configuration.load_storage()
            .then(() => {
                log.log("configuration loaded");
                this.set_export_timeout();
                elastic_client.update_from_config();
                // TODO: should actually connect/disconnect from all extension events
                //  and the content scripts.
                //  Right now the 'collectors' just do not export the events if
                //  disabled by configuration.
                // TODO: also must update content mouse capture interval
                //  which means sending the config value to the content scripts
            });
    };

    set_export_timeout() {
        if (this.export_timer)
            clearTimeout(this.export_timer);
        this.export_timer = null;

        if (configuration.get("elasticsearch.active")) {
            log.debug(`export in ${configuration.get("elasticsearch.export_interval")} seconds`);
            this.export_timer = setTimeout(
                this.export_events_periodic,
                configuration.get("elasticsearch.export_interval") * 1000
            );
        }
    };

    export_events_periodic() {
        const when_done = () => {
            this.set_export_timeout();
        };
        this.events.export()
            .then(when_done)
            .catch(when_done);
    };

    update_popup_view() {
        chrome.runtime.sendMessage({
            type: "render-events",
            events: this.events.statistics(),
        });
        chrome.runtime.sendMessage({
            type: "render-log",
            messages: log.messages,
        });
    };

    send_event_data() {
        chrome.runtime.sendMessage({
            type: "event-data",
            events: this.events.events,
        });
    };
}


const background = new Background();

