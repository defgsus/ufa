"use strict";



function mouse_event_to_object(event, target=null) {
    return {
        alt_key: event.altKey ? 1 : 0,
        button: event.button,
        client_x: event.clientX,
        client_y: event.clientY,
        ctrl_key: event.ctrlKey ? 1 : 0,
        input_source: event.mozInputSource,
        is_trusted: event.isTrusted,
        layer_x: event.layerX,
        layer_y: event.layerY,
        meta_key: event.metaKey ? 1 : 0,
        movement_x: event.movement_x,
        movement_y: event.movement_y,
        movement: event.movement,
        offset_x: event.offsetX,
        offset_y: event.offsetY,
        page_x: event.pageX,
        page_y: event.pageY,
        pressure: event.pressure || event.mozPressure || event.webkitForce,
        region: event.region,
        screen_x: event.screenX,
        screen_y: event.screenY,
        shift_key: event.shiftKey ? 1 : 0,
        target: element_to_object(target || event.target),
        //timestamp: event.timeStamp,  // not trustworthy among browsers
        timestamp: new Date().toISOString(),
        type: event.type,
    }
}


// ----- catch clicks ----

for (const type of ["click", "dblclick"]) {
    window.addEventListener(type, event => {
        //console.log(type, event);
        const event_object = mouse_event_to_object(event);
        event_object.type = type;
        //console.log("CONV", event_object);
        //console.log("TARGET", event_object.target);

        try {
            chrome.runtime.sendMessage({
                type: "content-mouse",
                event: event_object,
            });
        }
        catch (e) {}
    });
}


// ---- regularly catch mouse movement ----

class MouseAccumulator {
    constructor(event_name) {
        this.event_name = event_name;
        this.event = null;
        this.last_event = null;
        this.last_exported_event = null;
        this.reset();

        document.addEventListener(this.event_name, (event) => {
            this.event = event;
            if (this.last_event) {
                this.accumulate(this.last_event, this.event)
            }
            this.last_event = this.event;
        });

    }

    reset() { }

    accumulate(event1, event2) { }

    update_event_object(event) { }

    export = () => {
        if (this.event && this.event !== this.last_exported_event) {
            const event = this.event;
            const target = document.elementFromPoint(
                event.pageX,
                event.pageY,
            );
            const event_object = mouse_event_to_object(event, target);
            this.update_event_object(event_object);

            chrome.runtime.sendMessage({
                type: "content-mouse",
                event: event_object,
            });

            this.last_exported_event = event;
            this.reset();
        }
    }
}


class MouseMoveAccumulator extends MouseAccumulator {
    constructor() {
        super("mousemove");
    }

    reset() {
        this.movement_x = 0;
        this.movement_y = 0;
    }

    accumulate(event1, event2) {
        this.movement_x += Math.abs(event2.pageX - event1.pageX);
        this.movement_y += Math.abs(event2.pageY - event1.pageY);
    }

    update_event_object(event) {
        event.type = "move";
        event.movement_x = this.movement_x;
        event.movement_y = this.movement_y;
        event.movement = this.movement_x + this.movement_y;
    }
}


class MouseWheelAccumulator extends MouseAccumulator {
    constructor() {
        super("wheel");
    }

    reset() {
        this.wheel_x = 0;
        this.wheel_y = 0;
        this.wheel_z = 0;
    }

    accumulate(event1, event2) {
        this.wheel_x += Math.abs(event2.deltaX);
        this.wheel_y += Math.abs(event2.deltaY);
        this.wheel_z += Math.abs(event2.deltaZ);
    }

    update_event_object(event) {
        event.type = "wheel";
        event.wheel_x = this.wheel_x;
        event.wheel_y = this.wheel_y;
        event.wheel_z = this.wheel_z;
        event.wheel = this.wheel_x + this.wheel_y + this.wheel_z;
    }
}

const mouse_move_accum = new MouseMoveAccumulator();
const mouse_wheel_accum = new MouseWheelAccumulator();


function grab_mouse_accum() {
    try {
        mouse_move_accum.export();
        mouse_wheel_accum.export();
    }
    catch (e) { }

    setTimeout(grab_mouse_accum, 2000);
}
grab_mouse_accum();



/// ---- keyboard ----

class KeyListener {
    constructor() {
        this.key_events = {};
        this.hook();
    }

    hook() {
        document.addEventListener("keydown", this.on_key_down);
        document.addEventListener("keyup", this.on_key_up);
    }

    on_key_down = (event) => {
        if (!this.key_events[event.code]) {
            this.key_events[event.code] = this.event_to_object(event);
        }
    };

    on_key_up = (event) => {
        if (this.key_events[event.code]) {
            const event_obj = this.key_events[event.code];
            event_obj.timestamp_released = new Date();
            event_obj.duration = event_obj.timestamp_released.getTime() - event_obj.timestamp.getTime();
            event_obj.timestamp = event_obj.timestamp.toISOString();
            event_obj.timestamp_released = event_obj.timestamp_released.toISOString();

            chrome.runtime.sendMessage({
                type: "content-key",
                event: event_obj,
            });

            delete this.key_events[event.code];
        }
        else {
            const event_obj = this.event_to_object(event);
            event_obj.timestamp_released = event_obj.timestamp.toISOString();
            event_obj.timestamp = null;
        }
    };

    event_to_object = (event, target=null) => {
        return {
            alt_key: event.altKey ? 1 : 0,
            code: event.code,  // str
            ctrl_key: event.ctrlKey ? 1 : 0,
            is_trusted: event.isTrusted,
            key: event.key, // str
            meta_key: event.metaKey ? 1 : 0,
            shift_key: event.shiftKey ? 1 : 0,
            target: element_to_object(target || event.target),
            timestamp: new Date(),
            type: event.type,
        }
    };

}


const key_listener = new KeyListener();
