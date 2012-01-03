function performSearch() {
	searchObj = { full: $("#search-terms").val() };
	$.post(document.url, searchObj, function(response) {
		console.log(response);
	});
}