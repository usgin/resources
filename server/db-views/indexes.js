var exports = module.exports;

exports.repoViews = {
	views: {},
	fulltext: {
		full: {
			index: function(doc) {
				if (doc._id.indexOf("_design/") == 0) { return null; }

				var ret = new Document();
				function idx(obj) {
					for (var key in obj) {
				        switch (typeof obj[key]) {
					        case 'object':
					        	idx(obj[key]);
					        	break;
					        case 'function':
					        	break;
					        default:
					        	ret.add(obj[key]);
					        	break;
				        }
				    }
				}

				idx(doc);
				
				if (doc.hasOwnProperty("Published")) { ret.add(doc.Published, { field: "published", store: "yes" }); }	
				else { ret.add("false", { field: "published", store: "yes"}); }
				
				if (doc.hasOwnProperty("Links")) {
					for (l in doc.Links) {
						thisLink = doc.Links[l];
						if (thisLink.hasOwnProperty("ServiceType")) {
							ret.add(thisLink.ServiceType, { field: "services", store: "yes" });
						}
					}
				};
				
				if (doc.hasOwnProperty("Title")) {
					ret.add(doc.Title, { field: "title", store: "yes", index:"not_analyzed"}); // The not_analyzed part makes it so that you can sort on the entire field, but cannot search for individual words in the title
				}

				return ret;
			}
		},
		collection: {
			index: function(doc) {
				if (doc._id.indexOf("_design/") == 0) { return null; }

				var ret = new Document();
				if (doc.hasOwnProperty("Collections")) {
					for (c in doc.Collections) {
						ret.add(doc.Collections[c]);
						if (doc.hasOwnProperty("Published")) { ret.add(doc.Published, { field: "published", store: "yes" }); }
						else { ret.add("false", { field: "published", store: "yes" }); }
					}
				}
				
				return ret;
			}
		}
	}
};

exports.collectionViews = {
	views: {},
	fulltext: {
		parent: {
			index: function(doc) {
				if (doc._id.indexOf("_design/") == 0) { return null; }
				
				var ret = new Document();
				
				if (doc.hasOwnProperty("ParentCollections")) {
					for (pc in doc.ParentCollections) {
						ret.add(doc.ParentCollections[pc]);
					}
				}
				
				return ret;
			}
		}
	}
};