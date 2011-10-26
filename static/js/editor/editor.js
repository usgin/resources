$(document).ready(function() {
	typeChooser(startObj, "theResource");
});

function writeResource() {
	theResource = {};
	$("#theResource").children().each(function(index, ele) {
		domChooser($(this), theResource);
	});
	
	$("#the-new-resource").val(JSON.stringify(theResource));
	return true;
}