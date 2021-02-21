function split_url(url) {
    if (!url)
        return null;

    const a = document.createElement('a');
    a.setAttribute('href', url);
    const data = {
        protocol: a.protocol?.length > 1 ? a.protocol.slice(0, a.protocol.length - 1) : a.protocol,
        host: a.hostname,
        port: a.port,
        path: a.pathname,
        hash: a.hash,
    };
    if (url.search)
        data.param = a.search.split("&");
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
};