$(document).ready(function() {
	typeChooser(startObj, "theResource");
	
	// A couple of adjustments:
	//	First, make the text of attributes of titles in arrays un-editable	
	$("ul[eletype='array'] > li > div > div[ele='attribute']").removeAttr("contenteditable");
	//	Then, move the site information block below the other blocks
	$("#site-info-block").insertAfter("#map-block");
	// If the document is in no collections, indicate this
	collectionList = $("#collections-current-list");
	if (collectionList.children().length == 0) {
		collectionList.append("<li class='included-collection nil-collection'>Not published in any collection</li>");
	}
});

function writeResource() {
	theResource = {};
	$("#theResource").children().each(function(index, ele) {
		domChooser($(this), theResource);
	});
	
	$("#the-new-resource").val(JSON.stringify(theResource));
}