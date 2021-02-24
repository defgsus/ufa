/*
Some helper functions that DO NOT require web-extension context
 */

function not_empty_string(s) {
    return s && s !== "" ? s : undefined
}

function split_url(url) {
    if (!url)
        return null;

    const a = document.createElement('a');
    a.setAttribute('href', url);
    const data = {
        protocol: a.protocol?.length > 1 ? a.protocol.slice(0, a.protocol.length - 1) : a.protocol,
        host: not_empty_string(a.hostname),
        port: not_empty_string(a.port),
        path: not_empty_string(a.pathname),
        hash: not_empty_string(a.hash),
    };
    if (not_empty_string(url.search)) {
        const param = a.search.split("&");
        if (!(param.length === 1 && param[0] === ""))
            data.param = param;
    }
    return data;
}

function minimal_tab_data(tab) {
    if (tab) {
        return {
            tab_id: tab.id,
            tab_active: tab.active ? 1 : 0,
            tab_title: tab.title,
            tab_url: split_url(tab.url),
        };
    }
}


function element_to_object(elem) {
    const data = {
        tag: elem.tagName,
        class: [...elem.classList],
        id: elem.id,
        title: elem.title,
        text: elem.innerText ? elem.innerText.slice(0, 128) : undefined,
    };
    if (elem.getAttribute("href"))
        data.href = split_url(elem.getAttribute("href"));
    if (elem.getAttribute("src"))
        data.href = split_url(elem.getAttribute("src"));

    return data;
}


/**
 * Convert integer timestamp to iso-string
 * @param ts int
 * @returns {string|null}
 */
function convert_timestamp(ts) {
    try {
        return new Date(ts).toISOString();
    }
    catch (e) {
        return null;
    }
}