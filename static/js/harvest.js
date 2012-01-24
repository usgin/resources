$(document).ready(function() {
	$.post("/collection-names", { ids: "all" }, function(response) {
		collections = [];
		for (var r in response) { collections.push({ id: response[r].id, value: response[r].value.title }); }
		$("#collection-selector").autocomplete({
			source: collections,
			select: function(event, ui) {
				$("#selected-collection").val(ui.item.id);
				$(this).val(ui.item.value);
				return false;
			},
			change: function(event, ui) {
				if (!ui.item) {
					$("#selected-collection").val("");
				}
			}
		});
	});
});

