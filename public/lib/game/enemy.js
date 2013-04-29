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
	this.doingSomething = false;

	this.stats = {
		health     : 100,
		movement   : 1,
		conditions : [] //track status ailments?
	};

	//example structure for storing spritesheet and related animation data
	this.spritesheets = {
		enemy_anim : {
			//images : [this.game.assets.img.enemy_anim.tag], //match id loaded into assets from preloaded
			images : [this.game.assets.img.walker_anim.tag],
			frames : { width: 32, height: 32, regX: 16, regY: 16 }, //width/height for each frame in this spritesheet
			animations : {
				run : [0, 3, 'run', 3],
				walk : [0, 3, 'walk', 8]
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
		this.animation.x  = 16;
		this.animation.y  = 32;
		this.animation.vX = 1;

		this.animation.currentFrame = 0;
		this.animation.regX = this.animation.spriteSheet.frameWidth/2|0;
		this.animation.regY = this.animation.spriteSheet.frameHeight / 2 | 0;

		//this.game.stage.addChild(this.enemyWrap);
	};

	this.handleTick = function(evt){
		var self = this;
		// Hit testing the screen width, otherwise our sprite would disappear
		/*
		if (this.animation.x >= this.screen_width - 600) {
			this.animation.vX = 1;
			this.animation.direction = -90;
			this.animation.gotoAndPlay("walk");
		}

		if (this.animation.x < 16) {
			this.animation.vX = 2;
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
	*/

		if(self.doingSomething) return;
		var doSomething = Math.random();
		if(doSomething < 0.6 ) return;

		var targets = [];
		var curlvl = self.state.levels[self.state.curlvl];

		if( curlvl.map2d[self.tileX+1] && curlvl.map2d[ self.tileX+1][self.tileY]==14 ) targets.push( [self.tileX+1,self.tileY] );
		if( curlvl.map2d[self.tileX-1] && curlvl.map2d[ self.tileX-1][self.tileY]==14 ) targets.push( [self.tileX-1,self.tileY] );
		if( curlvl.map2d[ self.tileX][self.tileY+1]==14 ) targets.push( [self.tileX,self.tileY+1] );
		if( curlvl.map2d[ self.tileX][self.tileY-1]==14 ) targets.push( [self.tileX,self.tileY-1] );
		//console.log(targets);
		if(targets.length < 1) return;
		var which = Math.floor(Math.random()*targets.length);
		var dir = targets[which];
		self.doingSomething = true;
		//console.log("move enemy to ",dir);
		if(dir[0]<self.tileX && self.animation.currentAnimation == "walk") self.animation.gotoAndPlay("walk_h");
		else if(dir[0] > self.tileX && self.animation.currentAnimation == "walk_h") self.animation.gotoAndPlay("walk");
		createjs.Tween.get(self.animation).to({x:(dir[0]*32), y:(dir[1]*32) }, 1500).call(function(){
					self.doingSomething = false;
		});

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