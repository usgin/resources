function adjustInputWidths() {
	// Can't seem to do this with CSS only...
	$("#theResource li").each(function(index,ele) {
		liWidth = $(this).innerWidth();
		if (!$(this).children("span").hasClass("hidden")) { spanWidth = $(this).children("span").width() + 10; } //10 is the total padding on the span
		else { spanWidth = 0; }
		additional = $(this).hasClass("required") ? 8 : 16 + 8; // 8 is the padding + margin on the input, 16 is if there's a remove button
		$(this).children("input, select").width(liWidth - spanWidth - additional); 
	});
};

function collapseFieldsets() {
	$("legend").click(function() {
		$(this).toggleClass("collapsed");
		var isCollapsed = $(this).hasClass("collapsed");
		fieldset = $(this).parent();
		if (isCollapsed) { fieldset.css("height", 40); } else { fieldset.css("height", "auto"); }		
		fieldset.children().not("legend").each(function(index, ele) {
			if (!isCollapsed) {
				$(this).removeClass("hidden");
			} else {
				$(this).addClass("hidden");
			}
		});
	});
}