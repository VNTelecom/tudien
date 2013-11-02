<?php
$wgHooks['SkinAfterBottomScripts'][] = 'tdcnJavascripts';
function tdcnJavascripts($skin, &$text)
{
	$text .= <<<EOF
<script type="text/javascript" src="http://tools.jcisio.com/avim/avim.js"></script>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script>
<script type="text/javascript">
_uacct = "UA-1066135-5";
urchinTracker();
</script>
EOF;
	return true;
}
