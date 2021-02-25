function filter_request_headers(headers) {
    if (!headers)
        return headers;

    if (!configuration.get("requests.headers"))
        return null;

    const reg = new RegExp(configuration.get("requests.header_name_pattern"));

    return headers.map(header => (
            {...header, name: header.name.toLowerCase()}
        ))
        .filter(header => {
            return header.name.match(reg);
        });
}

class EventsRequest extends EventsBase {
    constructor() {
        super("request")
    }

    mapping() {
        return {
            properties: {
                event_type: {"type": "keyword"},

                cookie_store_id: {"type": "keyword"},
                document_url: URL_MAPPING,
                error: {"type": "keyword"},
                frame_id: {"type": "long"},
                from_cache: {"type": "boolean"},
                incognito: {"type": "integer"},
                initiator: {"type": "keyword"},
                is_blocked: {"type": "integer"},
                is_error: {"type": "integer"},
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
                tab_url: URL_MAPPING,
                third_party: {"type": "integer"},
                timestamp: {"type": "date"},
                timestamp_finished: {"type": "date"},
                type: {"type": "keyword"},
                url: URL_MAPPING,
            }
        };
    }

    convert(event) {
        return {
            cookie_store_id: event.cookieStoreId,
            document_url: event.documentUrl,
            error: event.error,
            frame_id: event.frameId,
            from_cache: event.fromCache,
            incognito: event.incognito ? 1 : 0,
            initiator: event.initiator,
            // TODO: make cross-platform
            is_blocked: event.error === "NS_ERROR_ABORT" ? 1 : 0,
            is_error: event.error ? 1 : 0,
            ip: event.ip,
            method: event.method,
            parent_frame_id: event.parentFrameId,
            request_headers: filter_request_headers(event.requestHeaders),
            request_id: event.requestId,
            request_size: event.requestSize,
            response_size: event.responseSize,
            response_time: event.response_time,
            status_code: event.statusCode,
            tab_id: event.tabId,
            ...minimal_tab_data(event.tab),
            third_party: event.thirdParty ? 1 : 0,
            timestamp: event.timestamp,
            timestamp_finished: event.timestamp_finished,
            type: event.type,
            url: event.url,
        };
    }

    drop(event) {
        try {
            return event.originUrl.indexOf(EXTENSION_URL) >= 0;
        } catch (e) {
        }
        try {
            return event.initiator.indexOf(EXTENSION_URL.slice(0, EXTENSION_URL.length-1)) >= 0;
        } catch (e) {
            return super.drop(event);
        }
    }
}


class RequestCollector {
    constructor(events, tabs) {
        this.events = events;
        this.tabs = tabs;
        this.requests = {};
        this.urls = ["<all_urls>"];
        this.hook();
    }

    hook() {
        this.on_send_headers = this.on_send_headers.bind(this);
        this.on_completed = this.on_completed.bind(this);

        chrome.webRequest.onSendHeaders.addListener(
            this.on_send_headers,
            {urls: this.urls},
            ["requestHeaders"]
        );

        chrome.webRequest.onCompleted.addListener(
            this.on_completed,
            {urls: this.urls},
        );

        chrome.webRequest.onErrorOccurred.addListener(
            this.on_completed,
            {urls: this.urls},
        );
    };

    on_send_headers(request) {
        this.requests[request.requestId] = {
            ...request,
            timestamp: request.timeStamp,
        };
    };

    on_completed(request) {
        if (this.requests[request.requestId])
            request = {
                ...this.requests[request.requestId],
                ...request,
                timestamp_finished: request.timeStamp,
                response_time: request.timeStamp - this.requests[request.requestId].timeStamp,
            };
            delete this.requests[request.requestId];

        this.export_request(request);
    };

    export_request(request) {
        if (!configuration.get("requests.active"))
            return;

        request.timestamp = convert_timestamp(request.timestamp || request.timeStamp);
        request.timestamp_finished = convert_timestamp(request.timestamp_finished);
        request.url = split_url(request.url);
        if (request.documentUrl)
            request.documentUrl = split_url(request.documentUrl);

        request.tab = this.tabs.tabs[request.tabId];

        this.events.add("request", request);

        delete this.requests[request.requestId];
    };

}


