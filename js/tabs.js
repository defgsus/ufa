
class EventsTab extends EventsBase {
    constructor() {
        super("tab");
    }

    mapping() {
        return {
            properties: {
                event_type: {"type": "keyword"},

                active: {"type": "integer"},
                attention: {"type": "integer"},
                audible: {"type": "integer"},
                cookie_store_id: {"type": "keyword"},
                discarded: {"type": "integer"},
                from_index: {"type": "integer"},
                height: {"type": "integer"},
                hidden: {"type": "integer"},
                highlighted: {"type": "integer"},
                id: {"type": "integer"},
                incognito: {"type": "integer"},
                index: {"type": "integer"},
                is_article: {"type": "integer"},
                is_reader_mode: {"type": "integer"},
                last_accessed: {"type": "date"},
                muted: {"type": "integer"},
                pinned: {"type": "integer"},
                share_microphone: {"type": "integer"},
                share_camera: {"type": "integer"},
                share_screen: {"type": "integer"},
                status: {"type": "keyword"},
                successor_id: {"type": "integer"},
                title: {"type": "keyword"},
                to_index: {"type": "integer"},
                type: {"type": "keyword"},

                width: {"type": "integer"},
                window_id: {"type": "integer"},
                zoom: {"type": "float"},

                url: URL_MAPPING,
            }
        };
    }

    convert(event) {
        return {
            active: event.active ? 1 : 0,
            attention: event.attention ? 1 : 0,
            audible: event.audible ? 1 : 0,
            cookie_store_id: event.cookieStoreId,
            discarded: event.discarded ? 1 : 0,
            from_index: event.from_index,
            height: event.height,
            hidden: event.hidden ? 1 : 0,
            highlighted: event.highlighted ? 1 : 0,
            id: event.id,
            incognito: event.incognito ? 1 : 0,
            index: event.index,
            is_article: event.isArticle ? 1 : 0,
            is_reader_mode: event.isInReaderMode ? 1 : 0,
            last_accessed: convert_timestamp(event.lastAccessed),
            muted: event.mutedInfo?.muted ? 1 : 0,
            pinned: event.pinned ? 1 : 0,
            share_microphone: event.sharingState?.microphone ? 1 : 0,
            share_camera: event.sharingState?.camera ? 1 : 0,
            share_screen: event.sharingState?.screen ? 1 : 0,
            status: event.status,
            successor_id: event.successorTabId,
            title: event.title,
            to_index: event.to_index,
            type: event.type,
            url: split_url(event.url),
            width: event.width,
            window_id: event.windowId,
            zoom: event.zoom,
        };
    }
}


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