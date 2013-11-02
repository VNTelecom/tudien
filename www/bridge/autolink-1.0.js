/**
 * TDCN bridge, Javascript version, written by jcisio
 * based on SE-Hilite 1.5 <fucoder.com>
 *
 */
Hilite = {
    elementid: "maincontent",
    exact: true,
    max_nodes: 1000,
    max_repeats: 3,
    onload: true
};
document.write('<script language="javascript" type="text/javascript" src="http://tudiencongnghe.com/bridge/pages2.js"></script>');

Hilite.keywords = function() {return tdcnPages;};

/**
 * Highlight a DOM element with a list of keywords.
 */
Hilite.hiliteElement = function(elm, query) {
    if (!query || elm.childNodes.length == 0)
	return;

    var qre = new Array();
    for (var i = 0; i < query.length; i ++) {
        query[i] = query[i].toLowerCase();
        if (Hilite.exact)
            qre.push('\\b'+query[i]+'\\b');
        else
            qre.push(query[i]);
    }

    qre = new RegExp(qre.join("|"), "i");

    var textproc = function(node) {
        var match = qre.exec(node.data);
        if (match) {
            var val = match[0];
	    var page = val.toLowerCase();
	    if (Hilite.repeats[page] == undefined) Hilite.repeats[page] = 0;
	    if (++Hilite.repeats[page] > Hilite.max_repeats) return node;
            
	    var k = '';
            var node2 = node.splitText(match.index);
            var node3 = node2.splitText(val.length);
            var link = node.ownerDocument.createElement('A');
	    link.href = 'http://tudiencongnghe.com/Special:Search/' + val;
            node.parentNode.replaceChild(link, node2);
            link.className = 'tdcnAutoLink';
            link.appendChild(node2);
            return link;
        } else {
            return node;
        }
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
    var q = Hilite.keywords();
    Hilite.repeats = new Array();
    if (q && ((Hilite.elementid && 
               (e = document.getElementById(Hilite.elementid))) || 
              (e = document.body)))
    {
	Hilite.hiliteElement(e, q);
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
