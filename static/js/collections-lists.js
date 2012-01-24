$(document).ready(function() {
	
});

function recordAsHtml(record, collectionId) {
	html = "<div id='" + record.id + "-container' class='record-container clear-block'>";
	//html += "<div id=\"" + record.id + "-remove-button\" class=\"record-remove-button\" onclick=\"removeRecord(\'" + record.id + "\', \'" + collectionId + "\')\"></div>";
	html += "<strong><a href='/resource/" + record.id + "/html'>" + record.doc.Title || "No Title Was Given" + "</a></strong>";
	html += "</div>";
	return html;
}

function showRecords(collectionId) {
	if ($("#" + collectionId + "-record-list").children().length > 0) {
		$("#" + collectionId + "-record-list").empty();
		$("#" + collectionId + "-record-list").removeClass("list-separator");
	} else {
		searchObj = { index: "collection", terms: collectionId };
		$.post("/search/", searchObj, function(response) {
			for (r in response.rows) {
				thisDoc = response.rows[r].doc, thisId = response.rows[r].id;
				$("#" + collectionId + "-record-list").addClass("list-separator");
				$("#" + collectionId + "-record-list").append(recordAsHtml(response.rows[r], collectionId));
			}
		});
	}
}

function removeCollection(collectionId) {
	
}

function editCollection(collectionId) {
	
}

function removeRecord(recordId, collectionId) {
	
}