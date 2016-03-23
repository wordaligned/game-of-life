These files construct a HTML5 Canvas based implementation of John Conway's game of life.

Files:

* conways-game-of-life.py (Re)generates life.html and various associated resources
* life.html The game of life web page
* life.js Javascript game of life implementation
* life.css CSS styling of the page

Dependencies:

* [Imagemagick][]. The "convert" tool is used to create coloured GIFs 
* [jQuery][]. Used in the web client for DOM manipulation
* [jQuery UI][]. Used in the web client for drag and drop effects
* RLE files. These encode the various patterns used in the implementation, and were downloaded from [conwaylife.com][]
* Button graphic icons. The Pause, Play etc icons used on the web client buttons were obtained from [glyphicons.com][]

Play the game of life at <http://wordaligned.org/life>

Questions or comments: mailto:tag@wordaligned.org

[Imagemagick]: http://www.imagemagick.org "Command line tools to manipulate images"
[jQuery]: http://jquery.com
[jQuery UI]: http://jqueryui.com
[conwaylife.com]: http://conwaylife.com/wiki "The Wiki for Conway's game of life"
[glyphicons.com]: http://glyphicons.com