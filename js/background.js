"use strict";


class Background {

    constructor() {
        this.events = new Events();
        this.tabs = new TabsCollector(this.events);
        this.request_collector = new RequestCollector(this.events, this.tabs);
        this.mouse = new Mouse(this.events, this.tabs);
        this.hook();
    }

    hook = () => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            //console.log("BACKGROUND on-message", message);
            switch (message.type) {

                case "popup-opened":
                    this.update_popup_statistics();
                    break;

                case "content-mouse":
                    this.mouse.add(message.event, sender.tab);
                    break;

                case "export":
                    this.events.export().then(this.update_popup_statistics);
                    break;
            }

            sendResponse();
        });

    };

    update_popup_statistics = () => {
        chrome.runtime.sendMessage({
            type: "popup-render-events",
            events: this.events.statistics(),
        });
    };

}


const background = new Background();

