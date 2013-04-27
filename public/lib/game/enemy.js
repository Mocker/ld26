/***

enemy.js

Enemy object to track metadata, interaction and graphics for the enemies

***/


function Enemy(playstate) {
	this.state = playstate;
	this.game  = playstate.game;

	//@toDo rename variable names
	this.animation = null;
	this.enemyWrap = new createjs.Container();

	this.stats = {
		health     : 100,
		movement   : 1,
		conditions : [] //track status ailments?
	};

	//example structure for storing spritesheet and related animation data
	this.spritesheets = {
		enemy_anim : {
			images : [this.game.assets.img.enemy_anim.tag], //match id loaded into assets from preloaded
			frames : { width: 64, height: 64, regX: 32, regY: 32 }, //width/height for each frame in this spritesheet
			animations : {
				stand : [1, 10]
			}
		}
	};

	// loads enemy up
	this.init = function(){
		// Get the screen witdh/height
		this.screen_width = this.game.stage.canvas.width;
		this.screen_height = this.game.stage.canvas.height;

		//Loads enemy animation
		this.loadAnimations();

		// Do stuff with the animation
		this.animation.gotoAndPlay("stand");
		this.animation.direction = -90;
		this.animation.vX = 1;// speed of the animation
		this.animation.x  = 100;
		this.animation.y  = 50;

		this.animation.currentFrame = 0;
		this.animation.regX = this.animation.spriteSheet.frameWidth/2|0;
		this.animation.regY = this.animation.spriteSheet.frameHeight / 2 | 0;

		this.game.stage.addChild(this.enemyWrap);
		alert(1);
	};

	this.handleTick = function(evt){

		// Hit testing the screen width, otherwise our sprite would disappear
		if (this.animation.x >= this.screen_width - 16) {
			// We've reached the right side of our screen
			// We need to walk left now to go back to our initial position
			this.animation.direction = -90;
			this.animation.gotoAndPlay("stand");
		}

		if (this.animation.x < 16) {
			// We've reached the left side of our screen
			// We need to walk right now
			this.animation.direction = 90;
			this.animation.gotoAndPlay("stand_h");
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

			// Adds a enemy to its wrapper
			this.enemyWrap.addChild(this.animation);
		}
	};

	//@toDo remove this
	this.init();
}