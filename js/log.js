

class Log {
    constructor(max_messages=30) {
        this.messages = [];
        this.max_messages = max_messages;
    }

    message(type, text, data=undefined) {
        console.log("LOG", type, text, data || "");

        if (this.messages.length >= this.max_messages) {
            this.messages = this.messages.shift();
        }
        this.messages.push({
            type, text, data, timestamp: new Date(),
        });
    }

    log(text, data) {
        this.message("log", text, data);
    }

    warn(text, data) {
        this.message("warn", text, data);
    }

    error(text, data) {
        this.message("error", text, data);
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
