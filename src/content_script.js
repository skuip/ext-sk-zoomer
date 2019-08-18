(function() {
	let stats = getFontSizeStatistics();

	let characters = 0;
	let mainFontSize = 16;
	let optimalZoom = 100;
	let actualZoom = 100;
	let xHeight = 8;
	let reqXHeight = 16;

	function handleOnMessage (data, sender, sendResponse) {
		sendResponse(`OK`);

		let div;
		let styles;

		reqXHeight = data.xHeight;

		// Use CSS "1ex" to determine the x-height by injecting
		// an element with the selected font size.
		div = document.createElement(`div`);
		div.style.fontSize = mainFontSize + `px`;
		div.style.paddingLeft = `1ex`;
		div.style.position = `absolute`;
		document.body.appendChild(div);
		styles = window.getComputedStyle(div);
		xHeight = parseFloat(styles.paddingLeft);
		document.body.removeChild(div);


		// Calculate required zoom level.
		optimalZoom = actualZoom = parseInt(reqXHeight / xHeight * 100);

		// Send message to background process to change zoom level for this tab.
		chrome.runtime.sendMessage({ zoom: actualZoom }, zoom);
	}

	/**
	 * Determine if the page fits horizontally with the current zoom level.
	 */
	function zoom () {
		// Give the UI thread some time to relayout the page.
		setTimeout(function () {
			let clientWidth = document.documentElement.clientWidth;
			let scrollWidth = document.documentElement.scrollWidth;

			if (clientWidth >= scrollWidth) {
				// No scrollbar, finished
				return logStatistics();
			}

			if (actualZoom === 100) {
				// We`re back at 100% and still doesn`t fit
				return logStatistics();
			}

			if (clientWidth > scrollWidth - 8) {
				// Some sites seem to miscalculate and have a scrollbar for a few pixels
				return logStatistics();
			}

			// Calculate new zoom level;
			actualZoom = parseInt(actualZoom * clientWidth / scrollWidth) - 2;
			if (actualZoom < 100) actualZoom = 100;

			// Send message to background process to change zoom level for this tab.
			chrome.runtime.sendMessage({ zoom: actualZoom }, zoom);
		}, 200);
	}

	function logStatistics () {
		chrome.runtime.sendMessage({ zoom: actualZoom, finished: true });

		return console.log(
			`SK-Zoomer: Requested x-height: ` + reqXHeight +
			`px font-size: ` + mainFontSize + `px x-height: ` + xHeight.toFixed(2) +
			`px optimum: ` + optimalZoom + `% actual: ` + actualZoom + `%`
		);
	}

	/**
	 * Gather font size statistics.
	 */
	function getFontSizeStatistics () {
		let i, j, node, rect, stats = {};
		let size;
		let tag;
		let tags = document.querySelectorAll(`*`);

		for (i = tags.length - 1; i >= 0; i--) {
			tag = tags[i];

			// No height or width, so skip (head, style, script, ...)
			rect = tag.getBoundingClientRect();
			if (rect.height === 0 || rect.width === 0) continue;

			// Font-size zero, so skip
			size = parseInt(window.getComputedStyle(tag).fontSize);
			if (size === 0) continue;

			for (j = tag.childNodes.length - 1; j >= 0; j--) {
				node = tag.childNodes[j];

				// Only interested in text nodes.
				if (node.nodeType !== 3) continue;

				if (!stats[size]) stats[size] = 0;

				stats[size] += node.textContent.replace(/\s+/, ` `).length;
			}
		}

		return stats;
	}


	// Get most used font size
	for (let prop in stats) {
		if (characters < stats[prop]) {
			characters = stats[prop];
			mainFontSize = parseInt(prop);
		}
	}

	// Listen for messages from the background process.
	chrome.runtime.onMessage.addListener(handleOnMessage);
})();

`OK`;
