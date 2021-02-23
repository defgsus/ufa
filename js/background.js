"use strict";


class Background {

    constructor() {
        this.events = new Events();
        this.events.add_events(new EventsMouse());
        this.events.add_events(new EventsRequest());
        this.events.add_events(new EventsTab());

        this.tabs_collector = new TabsCollector(this.events);
        this.request_collector = new RequestCollector(this.events, this.tabs_collector);
        this.mouse_collector = new MouseCollector(this.events, this.tabs_collector);
        this.hook();
    }

    hook = () => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            //console.log("BACKGROUND on-message", message);
            switch (message.type) {

                case "popup-opened":
                    this.update_popup_view();
                    break;

                case "config-opened":
                    this.update_config_view();
                    break;

                case "config-saved":
                case "config-reset":
                    configuration.config = message.type === "config-saved"
                        ? message.configuration
                        : DEFAULT_CONFIGURATION;
                    configuration.save_storage();
                    this.set_export_timeout();
                    // TODO: should actually connect/disconnect from all extension events
                    //  and the content scripts
                    this.update_config_view();
                    break;

                case "content-mouse":
                    this.mouse_collector.add(message.event, sender.tab);
                    break;

                case "export":
                    this.events.export()
                        .then(this.update_popup_view)
                        .catch(this.update_popup_view);
                    break;

            }

            //sendResponse();
        });

        this.export_timer = null;
        this.set_export_timeout();
    };

    set_export_timeout = () => {
        if (this.export_timer)
            clearTimeout(this.export_timer);
        this.export_timer = null;

        if (configuration.get("elasticsearch.active")) {
            this.export_timer = setTimeout(
                this.export_events_periodic,
                configuration.get("elasticsearch.export_interval")
            );
        }
    };

    export_events_periodic = () => {
        const when_done = () => {
            this.set_export_timeout();
            this.update_popup_view();
        };
        this.events.export()
            .then(when_done)
            .catch(when_done);
    };

    update_popup_view = () => {
        chrome.runtime.sendMessage({
            type: "popup-render-events",
            events: this.events.statistics(),
        });
        chrome.runtime.sendMessage({
            type: "popup-render-log",
            messages: log.messages,
        });
    };

    update_config_view = () => {
        chrome.runtime.sendMessage({
            type: "config-render",
            configuration: configuration.config,
        });
    }
}


const background = new Background();

