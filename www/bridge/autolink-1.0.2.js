/**
 * TDCN bridge, Javascript version, written by jcisio
 * Version: 1.0.2
 * based on SE-Hilite 1.5 <fucoder.com>
 * More info: http://tudiencongnghe.com/T%E1%BB%AB_%C4%91i%E1%BB%83n_c%C3%B4ng_ngh%E1%BB%87:Autolink/Javascript
 */
Hilite = {
	elementid: "maincontent",
	exact: true,
	max_nodes: 1000,
	max_repeats: 3,
	onload: true
};
document.write('<script language="javascript" type="text/javascript" src="http://tudiencongnghe.com/bridge/pages2.js"></script>');
Array.prototype.in_array = function (obj)
{
	var len = this.length;
	for (var x = 0 ; x < len ; x++ ) {
		if ( this[x] == obj ) return true;
	}
	return false;
}

/**
 * Highlight a DOM element with a list of keywords.
 */
Hilite.hiliteElement = function(elm) {
	if (elm.childNodes.length == 0) return;

	var qre = new Array();
	for (var i = 0; i < Hilite.keywords.length; i ++) {
		tmp = Hilite.keywords[i].toLowerCase();
		if (Hilite.exact)
			qre.push('\\b'+tmp+'(?=[\., \--";/])');
			//qre.push('\\b'+tmp+'\\b');
		else
			qre.push(tmp);
	}
	qre = new RegExp(qre.join("|"), "i");
	var textproc = function(node) {
		var match = qre.exec(node.data);
		if (match)
		{
			var val = match[0];
			var page = val.toLowerCase();
			if (Hilite.repeats[page] == undefined) Hilite.repeats[page] = 0;
			
			var node2 = node.splitText(match.index);
			var node3 = node2.splitText(val.length);
			if (val==val.toUpperCase() || tdcnPages.in_array(val) || !tdcnPages.in_array(val.toUpperCase()))
			if (++Hilite.repeats[page] <= Hilite.max_repeats) 
			{
				var link = node.ownerDocument.createElement('A');
				link.href = 'http://tudiencongnghe.com/Special:Search/' + val;
				node.parentNode.replaceChild(link, node2);
				link.className = 'tdcnAutoLink';
				link.appendChild(node2);
				return link;
			}
		}
		return node;
	};
	Hilite.walkElements(elm.childNodes[0], 1, textproc);
};

/**
 * Currently it would check for DOM element 'content', element 'container' and
 * then document.body in that order, so it only highlights appropriate section
 * on WordPress and Movable Type pages.
 */
Hilite.hilite = function() {
	var e = null;
	Hilite.keywords = tdcnPages;
	Hilite.repeats = new Array();
	if ((Hilite.elementid && (e = document.getElementById(Hilite.elementid))) || (e = document.body))
	{
		Hilite.hiliteElement(e);
	}
};

Hilite.walkElements = function(node, depth, textproc) {
	var skipre = /^(script|style|textarea)/i;
	var count = 0;
	while (node && depth > 0) {
		count ++;
		if (count >= Hilite.max_nodes) {
			var handler = function() {
				Hilite.walkElements(node, depth, textproc);
			};
			setTimeout(handler, 50);
			return;
		}

		if (node.nodeType == 1) { // ELEMENT_NODE
			if (!skipre.test(node.tagName) && node.childNodes.length > 0) {
				node = node.childNodes[0];
				depth ++;
				continue;
			}
		} else if (node.nodeType == 3) { // TEXT_NODE
			node = textproc(node);
		}

		if (node.nextSibling) {
			node = node.nextSibling;
		} else {
			while (depth > 0) {
				node = node.parentNode;
				depth --;
				if (node.nextSibling) {
					node = node.nextSibling;
					break;
				}
			}
		}
	}
};

// Trigger the highlight using the onload handler.
if (Hilite.onload) {
	if (window.attachEvent) {
		window.attachEvent('onload', Hilite.hilite);
	} else if (window.addEventListener) {
		window.addEventListener('load', Hilite.hilite, false);
	} else {
		var __onload = window.onload;
		window.onload = function() {
			Hilite.hilite();
			__onload();
		};
	}
}
