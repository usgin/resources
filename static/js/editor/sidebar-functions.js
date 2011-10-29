function addAuthor() {
	authorsFound = false;
	$(".object-header").each(function() {
		header = $(this);
		header.children().each(function() {
			if ($(this).html() == "Authors") {
				header[0].id = "authors-container";
				authorsFound = true;
			}
		});
	});
	if (authorsFound) {
		$("#authors-container + ul")[0].id = "authors-list";
		typeChooser(contactObj, "authors-list");
	}
}

function addDistributor() {
	
}

function addLink() {
	
}

function addFile() {
	
}