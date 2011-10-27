$(document).ready(function() {
	typeChooser(startObj, "theResource");
	
	// A couple of adjustments:
	//	First, make the text of attributes of titles in arrays un-editable	
	$("ul[eletype='array'] > li > div > div[ele='attribute']").removeAttr("contenteditable");
	//	Then, move the site information block below the other blocks
	$("#standard-addition-block").insertBefore("#site-info-block");
});

function writeResource() {
	theResource = {};
	$("#theResource").children().each(function(index, ele) {
		domChooser($(this), theResource);
	});
	
	$("#the-new-resource").val(JSON.stringify(theResource));
}