"use strict";

(() => {

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

        chrome.runtime.sendMessage({
            type: "content-mouse",
            event: event_object,
        });
    });
}


// ---- regularly catch mouse movement ----

let mouse_move_event = null;
let last_mouse_move_event = null;
let last_exported_mouse_move_event = null;
let movement_x = 0;
let movement_y = 0;

document.addEventListener("mousemove", (event) => {
    mouse_move_event = event;
    if (last_mouse_move_event) {
        movement_x += Math.abs(mouse_move_event.pageX - last_mouse_move_event.pageX);
        movement_y += Math.abs(mouse_move_event.pageY - last_mouse_move_event.pageY);
    }
    last_mouse_move_event = mouse_move_event
});

function grab_mouse_move() {

    if (mouse_move_event && mouse_move_event !== last_exported_mouse_move_event) {
        const target = document.elementFromPoint(
            mouse_move_event.pageX,
            mouse_move_event.pageY,
        );
        const event_object = mouse_event_to_object(mouse_move_event, target);
        event_object.type = "move";
        event_object.movement_x = movement_x;
        event_object.movement_y = movement_y;
        event_object.movement = movement_x + movement_y;
        console.log(movement_x, movement_y);
        chrome.runtime.sendMessage({
            type: "content-mouse",
            event: event_object,
        });

        last_exported_mouse_move_event = mouse_move_event;
        movement_x = 0;
        movement_y = 0;
    }

    setTimeout(grab_mouse_move, 2000);
}
grab_mouse_move();




})();
