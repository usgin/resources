var exports = module.exports;

exports.views = {
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