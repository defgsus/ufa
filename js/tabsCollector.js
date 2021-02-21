

class TabsCollector {
    constructor(events) {
        this.events = events;
        this.tabs = {};
        this.hook();
    }

    hook = () => {
        chrome.tabs.onCreated.addListener(this.on_created);
        chrome.tabs.onUpdated.addListener(this.on_updated);
        chrome.tabs.onRemoved.addListener(this.on_removed);
        chrome.tabs.onActivated.addListener(this.on_activated);
        chrome.tabs.onMoved.addListener(this.on_moved);
        chrome.tabs.onZoomChange.addListener(this.on_zoom);
        chrome.tabs.onMoved.addListener((tab) => {console.log("ATTACHED", tab)});
    };

    on_created = (tab) => {
        this.tabs[tab.id] = tab;
        this.export_tab_event("create", tab.id);
    };

    on_updated = (tabId, changeInfo, tab) => {
        this.tabs[tabId] = tab;
        this.export_tab_event("update", tabId);
    };

    on_removed = (tabId, removeInfo) => {
        this.export_tab_event("remove", tabId)
            .then(() => {
                delete this.tabs[tabId];
            });
    };

    on_activated = (event) => {
        this.export_tab_event("activate", event.tabId);
        if (event.previousTabId)
            this.export_tab_event("deactivate", event.previousTabId);
        // tabId, previousTabId, windowId
    };

    on_moved = (tabId, moveInfo) => {
        this.export_tab_event("move", tabId, moveInfo);
        // fromIndex, toIndex, windowId
    };

    on_zoom = (event) => {
        this.export_tab_event("zoom", event.tabId, {
            zoom: event.moveInfo.newZoomFactor,
        });
        // oldZoomFactor, newZoomFactor, windowId
    };

    export_tab_event = (type, id, extra_data) => {
        let tab = {
            tabId: id,
            type: type,
            ...extra_data,
        };

        return this.get_tab(id)
            .then(full_tab => {
                this.events.add("tab", {
                    ...full_tab,
                    ...tab,
                });
            })
            .catch(() => {
                const full_tab = this.tabs[id];
                this.events.add("tab", {
                    ...full_tab,
                    ...tab,
                });
            });
    };

    get_tab = (id) => {
        // TODO: probably has to be made cross-platform
        return browser.tabs.get(id);
    };
}

/*
active: true
attention: false
audible: false
cookieStoreId: "firefox-private"
discarded: false
favIconUrl: "chrome://branding/content/icon32.png"
height: 972
hidden: false
highlighted: true
id: 67
incognito: true
index: 14
isArticle: undefined
isInReaderMode: false
lastAccessed: 1613782723249
mutedInfo: Object { muted: false }
pinned: false
sharingState: Object { camera: false, microphone: false, screen: undefined }
status: "complete"
successorTabId: -1
title: "Private Browsing"
url: "about:blank"
width: 1920
windowId: 1

 */