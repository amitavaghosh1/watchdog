function $(el) {
    return document.querySelector(el)
}

var headerEl = $("#header")
var toggleEl = $("#toggle")
var stat = $("#status");

function toggleRecording(prev_state) {
    if (prev_state == "start") {
        headerEl.className = "record_on"
    } else {
        headerEl.className = "record_off"
    }
}

function toggleButton(prev_state) {
    if (prev_state == "start") {
        toggleEl.dataset.toggle = "stop";
        toggleEl.innerHTML = "Stop";
    } else {
        toggleEl.dataset.toggle = "start";
        toggleEl.innerHTML = "Start";
    }
}

toggleEl.addEventListener("click", function() {
    var toggleState = toggleEl.dataset.toggle;

    if (toggleState == "start") {
        chrome.runtime.sendMessage({ action: "start" }, () => {
            stat.innerHTML = "capturing"
        });

    } else if (toggleState == "stop") {
        chrome.runtime.sendMessage({ action: "stop" }, (response) => {
            stat.innerHTML = "done";
            setTimeout(() => {
                stat.innerHTML = ""
            }, 2000)
            processResponse(response)
        });
    }

    toggleButton(toggleState)
    toggleRecording(toggleState)

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
