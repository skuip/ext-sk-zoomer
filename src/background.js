/* global chrome */

function handleOnMessage(r, sender, sendResponse) {
	chrome.tabs.setZoom(sender.tab.id, r.zoom * 0.01);
	sendResponse(r);
}

function changeSettings(tab) {
	chrome.storage.local.get({
		xHeight: `16`
	}, function(items) {
		chrome.tabs.setZoom(tab.id, 1);

		chrome.tabs.sendMessage(tab.id, {xHeight: items.xHeight}, function () {
			// Message fails first time, since script isn`t yet injected.
			if (chrome.runtime.lastError) {
				if (window.console) console.log(chrome.runtime.lastError);
				chrome.tabs.executeScript(tab.id, {file: `content_script.js`}, function () {
					chrome.tabs.sendMessage(tab.id, {xHeight: items.xHeight});
				});
			}
		});

	});
}

chrome.runtime.onMessage.addListener(handleOnMessage);
chrome.browserAction.onClicked.addListener(changeSettings);
