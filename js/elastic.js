/**
 A simple elasticsearch client that supports
 some basic index management and bulk export
 of documents.
 */
class ElasticClient {

    constructor(host) {
        this.host = null;
        this.update_from_config();
    }

    update_from_config() {
        this.host = configuration.get("elasticsearch.hostname");
    };

    request(path, {method, params, body}) {
        if (typeof body === "object") {
            body = JSON.stringify(body);
        }

        const request = new Request(
            this.host + "/" + path,
            {
                method,
                params,
                body,
                headers: {
                    "content-type": "application/json"
                },
            },
        );
        return fetch(request);
    };

    /**
     * Create the index if it does not exist and
     * put/update the mapping.
     * @param index string, name
     * @param mapping object, a elasticsearch mapping
     * @returns {Promise<Response>}
     */
    update_index(index, mapping) {
        return this
            .request(index, {method: "HEAD"})
            .then(response => {
                if (response.status === 404) {
                    return this.request(index, {method: "PUT"})
                }
                else if (response.status === 200) {
                    return response
                } else {
                    throw {
                        message: `Invalid response ${response.status}`,
                        data: {status: response.status}
                    };
                }
            })
            .then(response => {
                return this.request(
                    `${index}/_mapping`,
                    {
                        method: "PUT",
                        body: mapping,
                    }
                );
            })
            .then(response => {
                if (response.status !== 200) {
                    return response.json()
                        .then(response => {
                            throw {
                                message: `Error mapping index '${index}'`,
                                data: {response}
                            }
                        })
                        .catch(error => {
                            throw error;
                        });
                }
                return response;
            });
    };

    /**
     * Bulk-exports a couple of documents.
     *
     * Note that the list of documents is exported in
     * one request, which usually must not exceed 10 megabytes.
     *
     * @param index {string}
     *      Name of index
     * @param documents {Array<Object>}
     *      List of objects, prepared for elasticsearch
     * @returns {Promise<Response>}
     */
    export_documents(index, documents) {
        let body = "";
        for (const doc of documents) {
            body += `{"index":{"_index": "${index}"}}\n`;
            body += JSON.stringify(doc) + "\n";
        }
        return this.request(
            `_bulk`,
            {
                method: "POST",
                body: body,
            }
        ).then(response => {
            if (response.status !== 200) {
                return response.json()
                    .then(response => {
                        throw {
                            message: `Error exporting bulk to index '${index}', status = '${response.status}'`,
                            data: {response}
                        }
                    });
            }
            return response;
        });
    };

    search(index, body, params) {
        return this.request(
            `${index}/_search`,
            {
                method: "GET",
                params: params,
                body: body,
            }
        );
    }
}


elastic_client = new ElasticClient();
