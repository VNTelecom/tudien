// $Id: autolink.js 19 2011-01-15 07:36:35Z jcisio $
/**
 * TDCN bridge, Javascript version, written by jcisio
 * Version: 2.1
 * based on SE-TDCN 1.5 <fucoder.com>
 * More info: http://tudiencongnghe.net/Project:Autolink/Javascript
 */
var TDCN = {
	scriptname: "autolink.js"
};
TDCN.in_array = function (arr, obj) {
	var len = arr.length;
	for (var x=0; x<len;) {
		if (arr[x++]==obj) return true;
	}
	return false;
}

/**
 * Highlight a DOM element with a list of keywords.
 */
TDCN.hiliteElement = function(elm) {
	if (elm.childNodes.length == 0) return;

	var qre = new Array();
	qre[0] = new Array();
	var aCurr = 0;
	var aItems = 0;
	var dText = document.body.innerHTML;
	for (var i=0; i<TDCN.keywords.length; i++) {
		if (! dText.match(TDCN.keywords[i])) continue;
		if (aItems++ >= 50) {
			aItems = 0;
			qre[++aCurr] = new Array();
		}
		var tmp = TDCN.keywords[i].toLowerCase();
		var text = '\\b'+tmp+'(?=[\., \--";/])';
		qre[aCurr].push(text);
	}
	for (var i=0; i<=aCurr; i++) qre[i] = new RegExp(qre[i].join("|"), "i");
	var textproc = function(node) {
		var match = qre[0].exec(node.data);
		for (var i=1; i<=aCurr; i++) {
			var tmp = qre[i].exec(node.data);
			if ((!match && tmp) || (match && tmp && (match.index>tmp.index || match[0].length<tmp[0].length)))
				match = tmp;
		}
		if (match) {
			var val = match[0];
			var page = val.toLowerCase();
			if (TDCN.repeats[page] == undefined) TDCN.repeats[page] = 0;
			
			var node2 = node.splitText(match.index);
			var node3 = node2.splitText(val.length);
			if (val==val.toUpperCase() || TDCN.in_array(tdcnPages, val) || !TDCN.in_array(tdcnPages, val.toUpperCase()))
			if (TDCN.maxrepeats==0 || ++TDCN.repeats[page] <= TDCN.maxrepeats) {
				var link = node.ownerDocument.createElement('A');
				link.href = 'http://tudiencongnghe.net/Special:Search/' + val;
				node.parentNode.replaceChild(link, node2);
				link.className = 'tdcnAutoLink';
				link.title = 'Tra cứu thông tin về "' + val + '"';
				if (TDCN.newwindow==1) link.target = '_blank';
				link.appendChild(node2);
				return link;
			}
		}
		return node;
	};
	TDCN.walkElements(elm.childNodes[0], 1, textproc);
};
TDCN.init = function() {
	if (! document.getElementsByTagName('body')[0]) {
		setTimeout(TDCN.init,100);
		return;
	}
	var s=document.createElement('script');
	s.setAttribute('src', 'http://tudiencongnghe.net/bridge/pages3.js');
	s.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
	void(s);
	if (TDCN.styling == 1) {
		var styleText = "a.tdcnAutoLink, a.tdcnAutoLink:link, a.tdcnAutoLink:visited, a.tdcnAutoLink:active {border:inherit;text-decoration:inherit;color:inherit;background-color:inherit;}a.tdcnAutoLink:hover {background-color:#e6e6fa;}";
		var styleNode = document.createElement("style");
		styleNode.appendChild(document.createTextNode(styleText));
		document.getElementsByTagName("head")[0].appendChild(styleNode);
	}
	TDCN.hilite();
}
/**
 * Currently it would check for DOM element 'content', element 'container' and
 * then document.body in that order, so it only highlights appropriate section
 * on WordPress and Movable Type pages.
 */
TDCN.hilite = function() {
	if (typeof(tdcnPages)=='undefined') {
		setTimeout(TDCN.hilite, 100);
		return;
	}
	var startTime = new Date();
	var e = null;
	TDCN.keywords = tdcnPages;
	TDCN.repeats = new Array();
	if ((TDCN.elementid && (e = document.getElementById(TDCN.elementid))) || (e = document.body)) {
		TDCN.hiliteElement(e);
	}
	var endTime = new Date();
	//alert((endTime - startTime) + "ms for " + tdcnPages.length + " entries");
};

TDCN.walkElements = function(node, depth, textproc) {
	var skipre = /^(script|style|textarea|input|select|option|strong|a|h\d)/i;
	var count = 0;
	while (node && depth > 0) {
		if (++count >= TDCN.maxnodes) {
			var handler = function() {TDCN.walkElements(node, depth, textproc)};
			setTimeout(handler, 50);
			return;
		}

		if (node.nodeType == 1) { // ELEMENT_NODE
			if (!skipre.test(node.tagName) && node.childNodes.length > 0) {
				node = node.childNodes[0];
				depth++;
				continue;
			}
		}
		else if (node.nodeType == 3) { // TEXT_NODE
			node = textproc(node);
		}

		if (node.nextSibling) {
			node = node.nextSibling;
		}
		else {
			while (depth-- > 0) {
				node = node.parentNode;
				if (node.nextSibling) {
					node = node.nextSibling;
					break;
				}
			}
		}
	}
};

TDCN.get_param = function (paramName, defaultValue) {
	var oRegex = new RegExp( '[\?&]' + paramName + '=([^&]+)', 'i' ) ;
	var oMatch = oRegex.exec(this.get_url()) ;
	return (oMatch && oMatch.length > 1)? oMatch[1]:defaultValue;
}

TDCN.get_url = function () {
	var scripts = document.getElementsByTagName('script');
	var url = '';
	for (var i=0; i< scripts.length; i++) {
		if (scripts[i].src.indexOf(this.scriptname) > 0) { 
			url=scripts[i].src;
			break;
		}
	}
	return url;
};

TDCN.elementid = TDCN.get_param('elementid', 'maincontent');
TDCN.maxnodes = TDCN.get_param('maxnodes', 1000);
TDCN.maxrepeats = TDCN.get_param('maxrepeats', 0);
TDCN.onload = TDCN.get_param('onload', 1);
TDCN.newwindow = TDCN.get_param('newwindow', 1);
TDCN.styling = TDCN.get_param('styling', 1);

// Trigger the highlight using the onload handler.
if (TDCN.onload == 1) {
	if (window.attachEvent) {
		window.attachEvent('onload', TDCN.init);
	}
	else if (window.addEventListener) {
		window.addEventListener('load', TDCN.init, false);
	}
	else {
		var __onload = window.onload;
		window.onload = function() {TDCN.init();__onload();};
	}
}
else {
	TDCN.init();
}

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-1066135-5']);
_gaq.push(['_trackPageview', '/Autolink']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

