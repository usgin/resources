$(document).ready(function() {
	initInputParentCollection("parentCollectionNames");
});

function initInputParentCollection(inputId) {
	var collections = [];
	var collectionPairs = {};
		
	$.post("/collection-names", {ids : "all"}, function(response) {
		for(var i = 0; i < response.length; i++) {
			collections.push({
				value : response[i].value.title /// text will be displayed in the iput box
			});
			
			collectionPairs[response[i].value.title] = response[i].id;
		}

		$("#" + inputId).autocomplete({
			source : function(req, res){
				res($.ui.autocomplete.filter(
					collections, extractLast(req.term)
				));
			},
			focus: function(){
				return false;
			},
			select: function(evt, ui){
				var terms = split(this.value); /// this.value is the value shows in this input element
				terms.pop();
				terms.push(ui.item.value);
				
				terms.push(""); /// add an empty element in the end for the following join function
				this.value = terms.join(", ");			
				return false;
			},
			close: function(evt, ui){
				var names = split($("#parentCollectionNames").val());
				names.pop();
				
				var ids = [];
				for(var n in names){
					ids.push(collectionPairs[names[n]]);
				}
				
				$("#parentCollectionValues").val(ids.join(", "));
			}
			
		});
	});
}

function split(value){
	return value.split(/,\s/);
}

function extractLast(term){
	return split(term).pop();
}

function onSubmit(){
	var parentCollections = split($("#parentCollectionValues").val());
	
	var collectionObj={
		collectionTitle: $("#collectionTitle").val(),
		parentCollections: parentCollections,
		collectionDescription: $("#collectionDescription").val()
	};
	
	$.post("/new-collection/", collectionObj);
}


