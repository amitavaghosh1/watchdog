// script that captures the request and response logs

var requestResponseMap = {}

chrome.webRequest.onBeforeRequest.addListener(details => {
    var traceId = details.requestId; // provided by chrome

    if (details.initiator && details.initiator.includes("chrome-extensions://")) {
        console.log("returning")
        return
    }

    capturing().then(res => {
        if (!res.capturing) {
            return
        }

        console.log("request", res, details.requestId, details.tabId)
        requestResponseMap[traceId] = {
            tabId: details.tabId,
            request: details,
        }
    })
}, { urls: ["https://*/*", "http://*/*"] });

chrome.webRequest.onCompleted.addListener(details => {
    var traceId = details.requestId;

    capturing().then(res => {
        if (!res.capturing) {
            return
        }

        console.log("response ", res, details.requestId, details.tabId)

        if (requestResponseMap.hasOwnProperty(traceId)) {
            requestResponseMap[traceId]["response"] = details
        }
    })


},
    { urls: ["https://*/*", "http://*/*"] }
);

function handleCapture(message, _, sendResponse) {
    if (message.action == "start") {
        capturing(true).then(() => {
            requestResponseMap = {}
        })
        // sendResponse({ status: "success" })
    } else if (message.action == "stop") {
        capturing(false).then(() => {
            var data = Object.values(requestResponseMap).
                map(nobj => ({ request: nobj.request, response: nobj.response }))

            if (data.length == 0) {
                sendResponse({ data: null })
                requestResponseMap = {}
                return
            }

            sendResponse({ data: JSON.stringify(data) })
            requestResponseMap = {}
        })
    } else if (message.action == "reset_state") {
        capturing(false).then(data => {
            sendResponse({ capturing: data.capturing })
        })
    }

    return true
}

chrome.runtime.onMessage.addListener(handleCapture)
chrome.runtime.onMessageExternal.addListener(handleCapture)

function capturing(val) {
    if (val == undefined) {
        return chrome.storage.local.get(["capturing"])
    }

    return chrome.storage.local.set({ capturing: val })
}

function captureData(data) {
    if (data.reqData) {
        requestResponseMap[data.reqData.uuid] = {
            request: data.reqData,
            response: null,
        }
    }

    if (data.respData) {
        let req = requestResponseMap[data.respData.uuid];
        if (req) {
            req.response = data.respData
        }
    }
}

function gen_uuid(a) { // a is placeholder
    return a           // if the placeholder was passed, return
        ? (              // a random number from 0 to 15
            a ^            // unless b is 8,
            Math.random()  // in which case
            * 16           // a random number from
            >> a / 4         // 8 to 11
        ).toString(16) // in hexadecimal
        : (              // or otherwise a concatenated string:
            [1e7] +        // 10000000 +
            -1e3 +         // -1000 +
            -4e3 +         // -4000 +
            -8e3 +         // -80000000 +
            -1e11          // -100000000000,
        ).replace(     // replacing
            /[018]/g,    // zeroes, ones, and eights with
            gen_uuid            // random hex digits
        )
}


