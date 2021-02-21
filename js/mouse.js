
class Mouse {

    constructor(events, tabs) {
        this.events = events;
        this.tabs = tabs;
    }

    add = (event, tab) => {
        if (tab) {
            event.tab_active = tab.active ? 1 : 0;
            event.tab_title = tab.title ? 1 : 0;
            event.tab_url = split_url(tab.url);
        }

        this.events.add("mouse", event);
    };

}


