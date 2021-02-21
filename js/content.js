"use strict";

(() => {

function element_to_object(elem) {
    return {
        tag_name: elem.tagName,
        class_list: [...elem.classList],
        id: elem.id,
        title: elem.title,
        //text: elem.innerText,
    }
}

function mouse_event_to_object(event) {
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
        movement_x: event.movementX,
        movement_y: event.movementY,
        offset_x: event.offsetX,
        offset_y: event.offsetY,
        page_x: event.pageX,
        page_y: event.pageY,
        pressure: event.mozPressure || event.webkitForce,
        region: event.region,
        screen_x: event.screenX,
        screen_y: event.screenY,
        shift_key: event.shiftKey ? 1 : 0,
        target: element_to_object(event.target),
        //timestamp: event.timeStamp,  // not trustworthy among browsers
        timestamp: new Date().toISOString(),
        type: event.type,
    }
}


for (const type of ["click", "dblclick"])
{
    window.addEventListener(type, (event) => {
        // console.log(event);
        chrome.runtime.sendMessage({
            type: "content-mouse",
            event: mouse_event_to_object(event),
        });

    });
}


})();
