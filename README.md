ld26 
====

Title: 256 Shades of Gray?

HTML5 game for Ludum Dare 26

2D top down, explore the underground structures of the moon base to shut down a bomb? Have to get to the bottom of each building to get the key code/card/cipher to access the next one.

Layout is procedurally generated for each level. 

Gun will be the splash of color and light up the level when shot


*note: every 5 minutes a git pull is updated at http://thegupstudio.com/ld26/public/ to see the latest copy in git

Game Structure :


Index.html - 
	set manifest of art assets to load
	call init() to create game object and pass id of canvas
	handleTick is called by the game and passed back to it

	game.js -
		core  game loop
		create stage, preloader
		intercept mouse and keyboard events and pass to correct state


		setupTitle() - 
			create title screen objects
			attach preloader events
			start preloader

		handleComplete() -
			called when preloaded is finished
			fade title screen out and remove
			start play state
			(todo- intro scene/ship landing)

		playstate.js -
			manages the maps and player throughout the game
			this.player = player object both meta and sprite details
			this.outside = map of outside
			this.levels = array of level maps, generated each time a new level is accessed

			init() -
				initialize outside map with level entrances
				initialize player character
				start playing?


----------------
TODO
-----------------

TILEMAP :
	-test with multiple tilesets of 32x32 and 64x64
	-store tile metadata (obstacle, special, trigger event? )

PLAYER OBJECT :
	-make one..
	-organize meta data (health/stats/inventory/skill unlocks .. )
	-map coordinates
	-setup sprite sheets and animations
	-bind keys

MAP GENERATION :
	- places craters, decoration, buildings in outside map
	- generation algorithm for levels (Digger algorithm)

ENEMIES :
	-enemy metadata
	-level placement
	-spritesheet and animations
	-basic ai controller (stay, wander, patrol, chase, fight)


DISPLAY :
	-scroll camera when moving (move all objects or translate canvas view?)
	-2d lighting use masks and color filters
	-use tweens for simple effects to make it more 'juicy'


UI :
	-instructions?
	-design? 
	-web page with game design?