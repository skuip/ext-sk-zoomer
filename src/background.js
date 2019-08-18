function handleOnMessage(r, sender, sendResponse) {
	if (r.finished) {
		chrome.runtime.onMessage.removeListener(handleOnMessage);
	}
	else {
		chrome.tabs.setZoom(sender.tab.id, r.zoom * 0.01);
		sendResponse(r);
	}
}

function changeSettings(tab) {
	chrome.runtime.onMessage.addListener(handleOnMessage);

	chrome.storage.local.get({
		xHeight: `16`
	}, function(items) {
		chrome.tabs.setZoom(tab.id, 1);

		chrome.tabs.sendMessage(tab.id, {xHeight: items.xHeight}, function (response) {
			if (response === `OK`) return console.log(tab.id, `Message received`);
			// Message fails first time, since script isn`t yet injected.
			if (chrome.runtime.lastError) {
				console.log(tab.id, `Injecting content_script.js`);
				chrome.tabs.executeScript(tab.id, {file: `content_script.js`}, function (response) {
					if (response[0] !== `OK`) {
						return console.warn(tab.id, `Unexpected script response`, response);
					}
					chrome.tabs.sendMessage(tab.id, {xHeight: items.xHeight}, function (response) {
						if (response === `OK`) return console.log(tab.id, `Message received`);
						console.warn(tab.id, `Unexpected message response`);
					});
				});
			}
		});

	});
}

chrome.browserAction.onClicked.addListener(changeSettings);
