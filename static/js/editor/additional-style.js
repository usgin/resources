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
	$("legend > span").unbind("click");
	$("legend > span").click(function() {
		$(this).parent().toggleClass("collapsed");
		var isCollapsed = $(this).parent().hasClass("collapsed");
		fieldset = $(this).parent().parent();
		if (isCollapsed) { fieldset.css("height", 45); } else { fieldset.css("height", "auto"); }		
		fieldset.children().not("legend").each(function(index, ele) {
			if (!isCollapsed) {
				$(this).removeClass("hidden");
			} else {
				$(this).addClass("hidden");
			}
		});
	});
}

function arrayItemNames() {
	$("ul.array > li > fieldset > legend, ul.array > li > span").addClass("hidden");
	$("ul.array > li > fieldset legend").addClass("small-legend");
	
	$("ul.array > li.object-container").each(function(index, ele) {
		 labelEle = $(this).find("fieldset > legend.hidden > span");
		 labelVals = $(this).find("fieldset > ul > li.key-value > input, select");
		 for (var i = 0; i < labelVals.length; i++) {
			 thisEle = $(labelVals[i]);
			 if (thisEle.val() != "") {
				 // Adjust the legend element
				 labelEle.parent().removeClass("hidden").addClass("small-legend obj-legend");
								 
				 // Authors and Distributors need one more button...
				 ulId = labelEle.parent("legend").parent("fieldset").parent("li").parent("ul").attr("id");
				 if (ulId == "theResource-Distributors" || ulId == "theResource-Authors") {
					 if (labelEle.parent().children("div.register-contact").length == 0) { 
						 regButton = $("<div class='register-contact'></div>").appendTo(labelEle.parent());
						 regButton.click(function() {
							 // Read the Contact itself
							 contact = writeResource($(this).parent("legend").next("ul"));
							 
							 // Save it
							 $.post("/new-contact/", contact, function(response) {
								$("#contact-message-container").empty();
								if (!response.success) {
									$("#contact-message-container").addClass("ui-state-error");
									$("#contact-message-container").append("<span class='ui-icon ui-icon-alert' style='float: left; margin-right: .3em;'></span>");
									$("#contact-message-container").append("<strong>Error:</strong>");
									$("#contact-message-container").append("<p> " + response.error + "</p>");
								} else {
									$("#contact-message-container").addClass("ui-state-highlight");
									$("#contact-message-container").append('<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>');
									$("#contact-message-container").append("<strong>Success:</strong>");
									$("#contact-message-container").append("<p> Your contact has been registered successfully!</p>");
									refreshContactOptions();
								}
								
								$("#saved-contact-dialog").dialog("open");
							});
						 });
					 }
				 }
				 
				 // All items need a removal button
				 if (labelEle.parent().children("div.remove-array-item-button").length == 0) { 
					 labelEle.parent().append("<div class='remove-array-item-button'></div>"); 					 
				 }
				 
				 // Add the new label to the legend > span
				 labelEle.html(thisEle.val());	
				 
				 // Setup the mechanism to change the legend > span if content is adjusted
				 thisEle.change(function() {
					 $(this).parent().parent().prev().children("span").html($(this).val());
				 });
				 break;
			 } 
		 }
		 collapseFieldsets();
	});	
}

function arrayButtons() {
	$(".add-button").click(function() {
		var propName = $(this).parent().next().attr("id").replace("theResource-", "");
		addArrayContent(propName);
	});
	$(".remove-array-item-button").click(function(){
		liHtml = $(this).parent("legend").parent("fieldset").parent("li");
		ulHtml = $(this).parent("legend").next("ul");
		sib = liHtml.next("li");
		while(sib.length != 0) {
			sibUl = sib.find("ul.object");
			sibUlId = sibUl.attr("id");
			sibUlIdParts = sibUlId.split("-");
			sibUlIdParts.push(sibUlIdParts.pop() - 1);
			sibUl.attr("id", sibUlIdParts.join("-"));
			sib = sib.next("li");
		}
		liHtml.remove();
		distributorPostProcessor();
	});
}

function removeButtons() {
	$(".remove-button").click(function() {
		liHtml = $(this).parent("li");
		parentHtml = liHtml.parent("ul");
		
		liId = liHtml.attr("id");
		idEnding = liId.split("-").pop();
		if (idEnding % 1 == 0) { // last part of the id is an integer -- removing an item from an array
			sib = liHtml.next();
			while (sib.length != 0) {
				// Adjust array numbers in the IDs of siblings of the removed
				sibId = sib.attr("id");
				sibIdParts = sibId.split("-");
				sibIdParts.push(sibIdParts.pop() - 1);
				sib.attr("id", sibIdParts.join("-"));
				sib = sib.next();
			}
		}
		// Remove the DOM ele
		liHtml.remove();
		arrayItemNames();
	});
}

function refreshContactOptions() {
	$.get("/contacts-by-name/", function(response) {
		contacts = [];
		for (var r in response) { contacts.push({ id: response[r].id, value: response[r].value.name }); }
		$("#new-contact-selector").autocomplete({
			source: contacts,
			select: function(event, ui) {				
				$("#new-selected-contact").val(ui.item.id);
				$(this).val(ui.item.value);
				return false;
			}			
		});
	});	
}