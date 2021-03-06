
class EventsTab extends EventsBase {
    constructor() {
        super("tab");
    }

    mapping() {
        return {
            properties: {
                event_type: {"type": "keyword"},

                active: {"type": "integer"},
                active_time: {"type": "float"},
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
                timestamp: {"type": "date"},
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
            active_time: event.active_time ? event.active_time / 1000. : undefined,
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
            timestamp: convert_timestamp(event.timestamp),
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
        this.tab_active_time = {};
        this.get_all_tabs()
            .then(tabs => {
                for (const tab of tabs) {
                    this.tabs[tab.tabId] = tab;
                    if (tab.active) {
                        this.tab_active_time[tab.id] = new Date().getTime();
                    }
                }
            });
        this.hook();
    }

    hook() {
        this.on_created = this.on_created.bind(this);
        this.on_updated = this.on_updated.bind(this);
        this.on_removed = this.on_removed.bind(this);
        this.on_activated = this.on_activated.bind(this);
        this.on_moved = this.on_moved.bind(this);
        this.on_zoom = this.on_zoom.bind(this);

        chrome.tabs.onCreated.addListener(this.on_created);
        chrome.tabs.onUpdated.addListener(this.on_updated);
        chrome.tabs.onRemoved.addListener(this.on_removed);
        chrome.tabs.onActivated.addListener(this.on_activated);
        chrome.tabs.onMoved.addListener(this.on_moved);
        chrome.tabs.onZoomChange.addListener(this.on_zoom);
    };

    on_created(tab) {
        this.tabs[tab.id] = tab;
        this.export_tab_event("create", tab.id);
    };

    on_updated(tabId, changeInfo, tab) {
        this.tabs[tabId] = tab;
        this.export_tab_event("update", tabId);
    };

    on_removed(tabId, removeInfo) {
        let active_time = undefined;
        if (this.tab_active_time[tabId]) {
            const timestamp = new Date().getTime();
            active_time = timestamp - this.tab_active_time[tabId];
        }

        this.export_tab_event("remove", tabId, {active_time})
            .then(() => {
                delete this.tabs[tabId];
                delete this.tab_active_time[tabId];
            });
    };

    on_activated(event) {
        const timestamp = new Date().getTime();
        this.tab_active_time[event.tabId] = timestamp;

        this.export_tab_event("activate", event.tabId);

        if (event.previousTabId) {
            let active_time = undefined;
            if (this.tab_active_time[event.previousTabId])
                active_time = timestamp - this.tab_active_time[event.previousTabId];

            this.export_tab_event(
                "deactivate", event.previousTabId,
                {active_time},
            );
            delete this.tab_active_time[event.previousTabId];
        }

        // tabId, previousTabId, windowId
    };

    on_moved(tabId, moveInfo) {
        this.export_tab_event("move", tabId, moveInfo);
        // fromIndex, toIndex, windowId
    };

    on_zoom(event) {
        this.export_tab_event("zoom", event.tabId, {
            zoom: event.moveInfo && event.moveInfo.newZoomFactor,
        });
        // oldZoomFactor, newZoomFactor, windowId
    };

    export_tab_event(type, id, extra_data) {
        if (!configuration.get("tabs.active"))
            return;

        let tab = {
            tabId: id,
            type: type,
            timestamp: new Date().getTime(),
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

    get_tab(id) {
        // TODO: probably has to be made cross-platform
        try {
            return browser.tabs.get(id);
        }
        catch (e) {
            return new Promise((resolve, reject) => {
                chrome.tabs.get(id, resolve);
            });
        }
    };

    get_all_tabs() {
        try {
            return browser.tabs.query({});
        }
        catch (e) {
            return new Promise((resolve, reject) => {
                chrome.tabs.query({}, resolve);
            });
        }
    };
}
