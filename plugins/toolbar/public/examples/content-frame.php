<?php
$quotes = array(
    "Although prepared for martyrdom, I preferred that it be postponed. - Sir Winston Churchill (1874 - 1965)",
    "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison (1847 - 1931), (attributed)",
    "The universal brotherhood of man is our most precious possession, what there is of it. - Mark Twain (1835 - 1910), Following the Equator",
    "Men live in a fantasy world. I know this because I am one, and I actually receive my mail there. - Scott Adams (1957 - )",
    "Sometimes a scream is better than a thesis. - Ralph Waldo Emerson (1803 - 1882), 'Journals,' 1836",
    "It is only by following your deepest instinct that you can lead a rich life, and if you let your fear of consequence prevent you from following your deepest instinct, then your life will be safe, expedient and thin. - Katharine Butler Hathaway",
    "I would rather be right and die than be wrong and kill. - Holly Lisle, Fire In The Mist, 1992",
    "Refuse to be ill. Never tell people you are ill; never own it to yourself. Illness is one of those things which a man should resist on principle. - Edward Bulwer-Lytton (1803 - 1873)"
);
$randomQuote =& $quotes[rand(0,count($quotes)-1)];
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
        <title>Content Frame (Frame's Test)</title>
        <link rel="stylesheet" type="text/css" href="../resources/css/boombox.css" />
        <style type="text/css">
            body{
                font-family: "Trebuchet MS";
                font-size: 11px;
                padding: 10px;
            }
        </style>
        <script type="text/javascript">
        function render(){
            if( parent.frames.boombox ){
                if( !parent.frames.boombox.ui ){
                    setTimeout(render,10);
                    return;
                }
                parent.frames.boombox.ui.render( document.getElementById('boombox') );
                self.onunload = function(){
                    parent.frames.boombox.ui.unrender();
                };
            }
        }
        </script>
    </head>
    <body onload="render();">
        <h1>Content Frame (Frame's Test)</h1>
        <div id="boombox" style="position: absolute; width: 1px; top: 64px; left:200px;" ></div>
        <a style='font-size: 150%;' href='?'>Reload this page...</a>
        <blockquote style="border: 1px solid #666; background: #ccc; padding: 10px; font-size: 140%;">
            <h4>Random Quote From Server</h4>
            <p><?php echo $randomQuote; ?></p>
        </blockquote>
        <p>This frame has no external javascript files. All it needs is the boombox.css. The javascript to render the boombox is only about 10 lines.</p>
        <script type='text/javascript'>
        document.write('<a href="view-source:'+window.location.href+'" target="_blank">View Source</a>');
        </script>
    </body> 
</html>
