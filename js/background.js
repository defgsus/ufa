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
                    this.update_popup();
                    break;

                case "content-mouse":
                    this.mouse_collector.add(message.event, sender.tab);
                    break;

                case "export":
                    this.events.export()
                        .then(this.update_popup)
                        .catch(this.update_popup);
                    break;
            }

            sendResponse();
        });

    };

    update_popup = () => {
        chrome.runtime.sendMessage({
            type: "popup-render-events",
            events: this.events.statistics(),
        });
        chrome.runtime.sendMessage({
            type: "popup-render-log",
            messages: log.messages,
        });
    };

}


const background = new Background();

