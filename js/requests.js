
class RequestCollector {
    constructor(events, tabs) {
        this.events = events;
        this.tabs = tabs;
        this.requests = {};
        this.urls = ["<all_urls>"];
        this.hook();
    }

    hook = () => {
        chrome.webRequest.onSendHeaders.addListener(
            this.on_send_headers,
            {urls: this.urls},
            ["requestHeaders"]
        );

        chrome.webRequest.onCompleted.addListener(
            this.on_completed,
            {urls: this.urls},
            //["requestHeaders"]
        );

        chrome.webRequest.onErrorOccurred.addListener(
            this.on_completed,
            {urls: this.urls},
            //["requestHeaders"]
        );
    };

    on_send_headers = (request) => {
        this.requests[request.requestId] = {
            ...request,
            timestamp: request.timeStamp,
        };
    };

    on_completed = (request) => {
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

    export_request = (request) => {
        request.timestamp = convert_timestamp(request.timestamp || request.timeStamp);
        request.timestamp_finished = convert_timestamp(request.timestamp_finished);
        request.url = split_url(request.url);
        if (request.documentUrl)
            request.documentUrl = split_url(request.documentUrl);

        const tab = this.tabs.tabs[request.tabId];
        if (tab) {
            request.tab_active = tab.active;
            request.tab_title = tab.title;
        }

        this.events.add("request", request);

        delete this.requests[request.requestId];
    };

}


