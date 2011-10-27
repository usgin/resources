$(document).ready(function() {
	typeChooser(startObj, "theResource");
	$("ul[eletype='array'] > li > div[ele='attribute']").removeAttr("contenteditable");
});

function writeResource() {
	theResource = {};
	$("#theResource").children().each(function(index, ele) {
		domChooser($(this), theResource);
	});
	
	$("#the-new-resource").val(JSON.stringify(theResource));
}