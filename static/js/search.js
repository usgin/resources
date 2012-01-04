function performSearch() {
	searchObj = { full: escape($("#search-terms").val()) };
	$.post(document.url, searchObj, function(response) {
		console.log(response);
	});
}