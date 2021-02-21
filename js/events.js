
const EXTENSION_URL = chrome.extension.getURL("");





class Events {

    converter = {
        "mouse": {
            "mapping": {
                "properties": {
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
                    offset_x: {"type": "integer"},
                    offset_y: {"type": "integer"},
                    page_x: {"type": "integer"},
                    page_y: {"type": "integer"},
                    pressure: {"type": "float"},
                    region: {"type": "keyword"},
                    screen_x: {"type": "integer"},
                    screen_y: {"type": "integer"},
                    shift_key: {"type": "integer"},
                    tab_active: {"type": "integer"},
                    tab_title: {"type": "keyword"},
                    tab_url: {
                        properties: {
                            protocol: {"type": "keyword"},
                            host: {"type": "keyword"},
                            port: {"type": "integer"},
                            path: {"type": "keyword"},
                            hash: {"type": "keyword"},
                            param: {"type": "keyword"},
                        },
                    },
                    target: {
                        "properties": {
                            "tag_name": {"type": "keyword"},
                            "id": {"type": "keyword"},
                            "class_list": {"type": "keyword"},
                            "title": {"type": "keyword"},
                        }
                    },
                    timestamp: {"type": "date"},
                    type: {"type": "keyword"},
                }
            },
            convert: (data) => {
                return data;
            },
        },

        "request": {
            "mapping": {
                "properties": {
                    event_type: {"type": "keyword"},

                    cookie_store_id: {"type": "keyword"},
                    document_url: {
                        properties: {
                            protocol: {"type": "keyword"},
                            host: {"type": "keyword"},
                            port: {"type": "integer"},
                            path: {"type": "keyword"},
                            hash: {"type": "keyword"},
                            param: {"type": "keyword"},
                        },
                    },
                    error: {"type": "keyword"},
                    frame_id: {"type": "long"},
                    from_cache: {"type": "boolean"},
                    incognito: {"type": "integer"},
                    initiator: {"type": "keyword"},
                    ip: {"type": "ip"},
                    method: {"type": "keyword"},
                    origin_url: {"type": "keyword"},
                    parent_frame_id: {"type": "long"},
                    request_headers: {
                        "properties": {
                            "name": {"type": "keyword"},
                            "value": {"type": "keyword"},
                        }
                    },
                    request_id: {"type": "keyword"},
                    request_size: {"type": "long"},
                    response_size: {"type": "long"},
                    response_time: {"type": "integer"},
                    status_code: {"type": "integer"},
                    tab_id: {"type": "long"},
                    tab_active: {"type": "integer"},
                    tab_title: {"type": "keyword"},
                    third_party: {"type": "integer"},
                    timestamp: {"type": "date"},
                    timestamp_finished: {"type": "date"},
                    type: {"type": "keyword"},
                    url: {
                        properties: {
                            protocol: {"type": "keyword"},
                            host: {"type": "keyword"},
                            port: {"type": "integer"},
                            path: {"type": "keyword"},
                            hash: {"type": "keyword"},
                            param: {"type": "keyword"},
                        },
                    },
                }
            },
            "convert": (event) => {
                return {
                    cookie_store_id: event.cookieStoreId,
                    document_url: event.documentUrl,
                    error: event.error,
                    frame_id: event.frameId,
                    from_cache: event.fromCache,
                    incognito: event.incognito ? 1 : 0,
                    initiator: event.initiator,
                    ip: event.ip,
                    method: event.method,
                    parent_frame_id: event.parentFrameId,
                    request_headers: event.requestHeaders,
                    request_id: event.requestId,
                    request_size: event.requestSize,
                    response_size: event.responseSize,
                    response_time: event.response_time,
                    status_code: event.statusCode,
                    tab_id: event.tab_id,
                    tab_active: event.tab_active ? 1 : 0,
                    tab_title: event.tab_title,
                    third_party: event.thirdParty ? 1 : 0,
                    timestamp: event.timestamp,
                    timestamp_finished: event.timestamp_finished,
                    type: event.type,
                    url: event.url,
                }
            },
            drop: (event) => {
                try {
                    return event.originUrl.indexOf(EXTENSION_URL) >= 0;
                } catch (e) {
                    return false;
                }
            },
        },

        "tab": {
            "mapping": {
                "properties": {
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

                    url: {
                        properties: {
                            protocol: {"type": "keyword"},
                            host: {"type": "keyword"},
                            port: {"type": "integer"},
                            path: {"type": "keyword"},
                            hash: {"type": "keyword"},
                            param: {"type": "keyword"},
                        },
                    },
                }
            },
            "convert": (event) => {
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
                }
            },
        }
    };

    constructor() {
        this.events = {};
        this.num_collected = {};
        this.num_exported = {};
        this.elastic_index_updated = {};
    }

    add = (type, data) => {
        console.log("EVENT", type, data?.type, data);

        const converter = this.converter[type];
        if (!converter)
            throw `No converter for event type '${type}'`;

        if (converter.drop && converter.drop(data)) {
            //console.log("DROPPED EVENT", type, data);
            return;
        }

        if (!this.events[type])
            this.events[type] = [];
        this.events[type].push(data);
        
        if (!this.num_collected[type])
            this.num_collected[type] = 0;
        this.num_collected[type] += 1;
    };

    statistics = () => {
        return {
            num_collected: this.num_collected,
            num_exported: this.num_exported,
        };
    };
    
    export = () => {
        const promises = [];

        for (const type of Object.keys(this.events)) {
            if (!this.events[type]?.length)
                continue;

            const index_name = `browser-events-${type}`;

            const converter = this.converter[type];
            if (!converter)
                throw `No converter for event type '${type}'`;

            const events = this.events[type].map(event => ({
                ...converter.convert(event),
                event_type: type,
            }));

            promises.push(
                elastic_client
                .update_index(index_name, converter.mapping)
                .then(() => {
                    this.elastic_index_updated[type] = true;
                })
                .then(() => {
                    return elastic_client.export_documents(index_name, events);
                })
                .then(response => response.json())
                .then(response => {
                    console.log("BULK", response);
                    // TODO: actually have to parse bulk response
                    if (!this.num_exported[type])
                        this.num_exported[type] = 0;
                    this.num_exported[type] += this.events[type].length;
                    this.events[type] = [];
                })
            );
        }

        return Promise.all(promises);
    };

}
