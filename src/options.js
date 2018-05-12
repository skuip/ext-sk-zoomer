function save_options(ev) {
	ev.preventDefault();

	var xHeight = document.getElementById(`xHeight`).value;

	chrome.storage.local.set({
		xHeight: xHeight
	}, function() {
		var status = document.getElementById(`status`);
		status.textContent = `Options saved.`;
		setTimeout(function() { status.textContent = ``; }, 1000);
	});
}

function restore_options() {
	chrome.storage.local.get({
		xHeight: `16`
	}, function(items) {
		document.getElementById(`xHeight`).value = parseInt(items.xHeight);
	});
}


document.addEventListener(`DOMContentLoaded`, restore_options);
document.querySelector(`form`).addEventListener(`submit`, save_options);
document.getElementById(`save`).addEventListener(`click`, save_options);
