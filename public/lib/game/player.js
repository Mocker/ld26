/***

player.js

Player object to track metadata, interaction and graphics for the player character

***/


function Player(playstate) {
	this.state = playstate;
	this.game  = playstate.game;
	this.name  = "Bob";

	//@toDo rename variable names
	this.animation = null;
	this.playerWrap = new createjs.Container();

	this.stats = {
		health     : 100,
		movement   : 1,
		conditions : [] //track status ailments?
	};

	this.inventory = [];

	//example structure for storing spritesheet and related animation data
	this.spritesheets = {
		player_anim : {
			images : [this.game.assets.img.player_anim.tag], //match id loaded into assets from preloaded
			frames : { width: 64, height: 64, regX: 32, regY: 32 }, //width/height for each frame in this spritesheet
			animations : {
				run : [1, 9, 'run', 1],
				walk : [1, 9, 'walk', 4],
				stand : [0]
			}
		}
	};

	// loads player up
	this.init = function(){
		// Get the screen witdh/height
		this.screen_width = this.game.stage.canvas.width;
		this.screen_height = this.game.stage.canvas.height;

		console.log(this.game.stage);

		console.log(this.screen_width);

		//Loads player animation
		this.loadAnimations();

		// Do stuff with the animation
		this.animation.gotoAndPlay("run");
		this.animation.direction = -90;
		this.animation.vX = 1;// speed of the animation
		this.animation.x  = 100;
		this.animation.y  = 50;

		this.animation.currentFrame = 0;
		this.animation.regX = this.animation.spriteSheet.frameWidth/2|0;
		this.animation.regY = this.animation.spriteSheet.frameHeight / 2 | 0;

		this.game.stage.addChild(this.playerWrap);
	};

	this.handleTick = function(evt){

		// Hit testing the screen width, otherwise our sprite would disappear
		if (this.animation.x >= this.screen_width - 16) {
			// We've reached the right side of our screen
			// We need to walk left now to go back to our initial position
			this.animation.direction = -90;
			this.animation.gotoAndPlay("run");
		}

		if (this.animation.x < 16) {
			// We've reached the left side of our screen
			// We need to walk right now
			this.animation.direction = 90;
			this.animation.gotoAndPlay("run_h");
		}

		// Moving the sprite based on the direction & the speed
		if (this.animation.direction == 90) {
			this.animation.x += this.animation.vX;
		}
		else {
			this.animation.x -= this.animation.vX;
		}

		// update the stage:
		this.game.stage.update();
	};

	//go thorugh this.animation and load spritesheet from assets for each
	this.loadAnimations = function(){
		for (var key in this.spritesheets ) {
			sprite = this.spritesheets[key];

			// Creates a new animation
			var spriteSheet = new createjs.SpriteSheet(sprite);
			this.animation = new createjs.BitmapAnimation(spriteSheet);

			// Creates Flipped Frames
			createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);

			// Adds a player to its wrapper
			this.playerWrap.addChild(this.animation);
		}
	};

	//@toDo remove this
	this.init();
}