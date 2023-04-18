function $(el) {
    return document.querySelector(el)
}

var headerEl = $("#header")
var startEl = $("#start")
var stopEl = $("#stop")
var stat = $("#status");

function toggleRecording(prev_state) {
    // if (prev_state == "start") {
    //     headerEl.className = "record_on"
    // } else {
    //     headerEl.className = "record_off"
    // }
    //

    withToggleState(function(message) {
        let recording = message && message.capturing;

        if (recording === undefined) {
            headerEl.className = "record_off"
            stat.innerHTML = ""
            return
        }

        if (recording) {
            headerEl.className = "record_on"
            stat.innerHTML = "capturing"
        } else {
            headerEl.className = "record_off"
            stat.innerHTML = "done"
        }
    })
}

stopEl.addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "stop" }, (response) => {
        stat.innerHTML = "done";
        setTimeout(() => {
            stat.innerHTML = ""
        }, 2000)
        processResponse(response)
    });

    setTimeout(() => {
        toggleRecording("stop")
    }, 100)
})

startEl.addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "start" }, () => {
        stat.innerHTML = "capturing"
    });


    setTimeout(() => {
        toggleRecording("start")
    }, 100)
})


function processResponse(response) {
    if (!response) {
        stat.innerHTML = "something went wrong";
        stat.innerHTML += response
        return
    }

    if (!response.data) {
        stat.innerHTML = "nothing captured. start again"
        return
    }

    var blob = new Blob([response.data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: 'trace_logs.json'
    })
}

window.onload = function() {
    toggleRecording("")
}

function withToggleState(cb) {
    chrome.storage.local.get(["capturing"], function(resp) {
        cb(resp)
    })
}

