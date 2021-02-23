

class Log {
    constructor(max_messages=30) {
        this.messages = [];
        this.max_messages = max_messages;
    }

    message(type, text, data=undefined) {
        if (data)
            console.log("LOG", type, text, data);
        else
            console.log("LOG", type, text);

        if (this.messages.length >= this.max_messages) {
            this.messages.shift();
        }

        this.messages.push({
            type, text, data, timestamp: new Date(),
        });
    }

    debug(text, data) {
        try {
            if (!configuration.get("debug.log_debug"))
                return;
        }
        catch (e) { }
        this.message("debug", text, data);
    }

    log(text, data) {
        try {
            if (!configuration.get("debug.log_log"))
                return;
        }
        catch (e) { }
        this.message("log", text, data);
    }

    warn(text, data) {
        this.message("warn", text, data);
    }

    error(text, data) {
        this.message("error", text, data);
    }

    event(event_type, event) {
        try {
            if (!configuration.get("debug.log_event"))
                return;
        }
        catch (e) { }
        this.message("event", `${event_type}.${event.type}`, event);
    }

    catch_error(prefix, error) {
        let message = error?.message;
        if (!message) {
            try {
                message = error.toString();
            } catch (e) {

            }
        }
        if (!message) {
           message = `${error}`
        }

        let data = null;
        if (error?.data) {
            data = error.data;
        } else {
            // TODO: actually need to convert javascript Error instances to json
            try {
                data = JSON.parse(JSON.stringify(error));
            }
            catch (e) {
            }
        }
        this.error(`${prefix}: ${message}`, data);
    }
}


const log = new Log();
