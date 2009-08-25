<?php
$xspf_url = @$_REQUEST['xspf_url'];

function addCdata($match){
	$data = $match[1];
	if( !empty($data) ){
		return "><![CDATA[".$data."]]></";
	}
	return $match[0];
}

if( $xspf_url ){
	header('Content-Type: text/xml');
	echo preg_replace_callback("#>([^<\n]+?)\</#",'addCdata',file_get_contents($xspf_url));
	exit(0);
}
$url = @$_REQUEST['url'];
$default = 'http://hideout.com.br/shows/hideout-48.xspf';
$config = require_once(dirname(__FILE__).'/config.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-gb" lang="en-gb" >
    <head>
		<title>XSPF Example Page</title>
		<link rel="stylesheet" type="text/css" href="../resources/css/boombox.css" />
        <script type="text/javascript" src="../resources/js/ext-core-debug.js"></script>
        <script type="text/javascript" src="../resources/js/soundmanager2-nodebug-jsmin.js"></script>
		<!-- include boombox files -->
		<?php
		if( $config['debug'] ){
			?>
        <script type="text/javascript" src="../source/boombox/Base.js"></script>
		<script type="text/javascript" src="../source/util/Hash.js"></script>
		<script type="text/javascript" src="../source/boombox/Track.js"></script>
		<script type="text/javascript" src="../source/boombox/Playlist.js"></script>
		<script type="text/javascript" src="../source/boombox/playlist/Xspf.js"></script>
		<script type="text/javascript" src="../source/boombox/Player.js"></script>
		<script type="text/javascript" src="../source/boombox/ui/FullPlayer.js"></script>
			<?php
		}
		else{
			?>
		<script type="text/javascript" src="../package/boombox.js"></script>
			<?php
		}
		?>
        <script type="text/javascript">
            soundManager.url = '../resources/swf/';
			var pl = new Fabs.boombox.playlist.Xspf({url:'xspf.php?xspf_url=<?php echo urlencode($url ? $url : $default); ?>'});
            var p = new Fabs.boombox.Player({autoPlay: true, shuffle: true, playlist: pl, volume: 50});
			window.ui = new Fabs.boombox.ui.FullPlayer({player: p, renderTo: 'boombox', width: 300, maxListHeight: 150, draggable: true, resizeable: true});
        </script>
        <style type="text/css">
            body{
                font-family: "Trebuchet MS";
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <h1>Fab's BoomBox + XSPF Playlist</h1>
        <div id="boombox"></div>
    </body>
</html>