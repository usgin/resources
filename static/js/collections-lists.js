$(document).ready(function() {
	
});

function recordAsHtml(record) {
	html = "<div id='" + record.id + "-container' class='record-container'>";
	html += "<div id='" + record.id + "-remove-button'></div>";
	html += "<a href='/resource/" + record.id + "/html'>" + record.doc.Title || "No Title Was Given" + "</a>";
	html += "</div>";
	return html;
}

function editRecords(collectionId) {
	if ($("#" + collectionId + "-record-list").children().length > 0) {
		$("#" + collectionId + "-record-list").empty();
		$("#" + collectionId + "-record-list").removeClass("list-separator");
	} else {
		searchObj = { index: "collection", terms: collectionId };
		$.post("/search/", searchObj, function(response) {
			for (r in response) {
				thisDoc = response[r].doc, thisId = response[r].id;
				$("#" + collectionId + "-record-list").addClass("list-separator");
				$("#" + collectionId + "-record-list").append(recordAsHtml(response[r]));
			}
		});
	}
}