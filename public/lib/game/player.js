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
		movement   : 8,
		conditions : [] //track status ailments?
	};

	this.bullets = [];

	this.inventory = [];
	this.vel = [0,0];
	this.pos = {x:0,y:0};

	//example structure for storing spritesheet and related animation data
	this.spritesheets = {
		player_anim : {
			images : [this.game.assets.img.player_sheet.tag],
			frames : 
				//{ width: 21, height: 32, regX: 12, regY: 16},
				
				[
				[0,74,21,32], //running left 1 
				[22,74,21,32], //running left 2 
				[102,0,21,32], //				//running left 3 
				[68,37,21,32], //				running left 4 
				[44,74,21,32], //				running left 5 
				[90,37,21,32], //				running left 6 
				[68,70,21,32], //				running left 7 
				[90,70,21,32], //				running left 8 
				[0,0,33,36], //				shooting 1 
				[34,0,33,36], //				shooting 2 
				[68,0,33,36], //				shooting 3 
				[ 34, 37, 33, 36, ], //shooting4
				[0,37,33,36], //				shooting 5 
				
			], 
			animations : {
				run : [0, 7, 'run', 1],
				walk : [0, 7, 'walk', 4],
				stand : [11],
				shoot : [8,12, 'shoot',5],
			}
		}
		/*
		player_anim : {
			images : [this.game.assets.img.player_anim.tag], //match id loaded into assets from preloaded
			frames : { width: 64, height: 64, regX: 32, regY: 32 }, //width/height for each frame in this spritesheet
			animations : {
				run : [1, 9, 'run', 1],
				walk : [1, 9, 'walk', 4],
				stand : [3]
			}
		}
		*/
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
		this.animation.gotoAndPlay("stand");
		this.animation.direction = -90;
		this.animation.vX = 1;// speed of the animation
		this.animation.x  = 100;
		this.animation.y  = 50;

		this.animation.currentFrame = 0;
		this.animation.regX = this.animation.spriteSheet.frameWidth/2|0;
		this.animation.regY = this.animation.spriteSheet.frameHeight / 2 | 0;

		this.state.wrap.addChild(this.playerWrap);
	};

	this.handleTick = function(evt){

		// Bullets
		//speed = 15;
		speed=5;
		for(var i=0;i< this.bullets.length;i++) {
            var s =  this.bullets[i];
            s.x += speed;
        }

		// Hit testing the screen width, otherwise our sprite would disappear
		
		//when firing unable to move
		if(this.isFiring) this.vel = [0,0];

		this.state.curmap.move(this.vel);

		/*
		if(this.vel[0] == 0 && this.vel[1] == 0 && (this.animation.currentAnimation !="stand" || this.animation.currentAnimation != "stand_h")){
			this.animation.gotoAndPlay("stand");
		} */
		if(this.vel[1] != 0 && this.animation.currentAnimation != "walk" ) this.animation.gotoAndPlay("walk");
		if(this.vel[0] < 0 && this.animation.currentAnimation != "walk" ) this.animation.gotoAndPlay("walk");
		if(this.vel[0] > 0 && this.animation.currentAnimation != "walk_h") this.animation.gotoAndPlay("walk_h");
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

	this.setDirection = function(angle){
		//todo check current direction and change sprite if new
		if(this.animation.direction==angle) return;
		this.animation.direction = angle;
	};

	this.moveUp = function(isMouseUp){
		if(isMouseUp){
			this.vel[1] = 0;
			return;
		}
		this.setDirection(0);
		this.vel[1] = -this.stats.movement;
	};
	this.moveDown = function(isMouseUp){
		if(isMouseUp){
			this.vel[1] = 0;
			return;
		}
		this.setDirection(180);
		this.vel[1] = this.stats.movement;
	};
	this.moveLeft = function(isMouseUp){
		if(isMouseUp){
			this.vel[0] = 0;
			this.animation.gotoAndPlay("stand");
			return;
		}
		this.setDirection(90);
		this.vel[0] = -this.stats.movement;
	};
	this.moveRight = function(isMouseUp){
		if(isMouseUp){
			this.vel[0] = 0;
			this.animation.gotoAndPlay("stand_h");
			return;
		}
		this.setDirection(270);
		this.vel[0] = this.stats.movement;
	};

	this.enter = function(isMouseUp){
		console.log('enter');
		var self = this;
		if(isMouseUp) return;

		//check for map objects near player to interact with
		if(self.state.curlvl == 0){

			//check to see if keypad is already visible
			if(self.state.keypadWrap.visible){
				//TODO:: check keycode - enter building blah blah

				createjs.Tween.get(self.state.keyInputs.text).to({alpha:0 }, 1000).call(function(){
					self.state.keyInputs.accepted.alpha = 0;
					self.state.keyInputs.accepted.visible = true;
					createjs.Tween.get(self.state.keyInputs.accepted).to({alpha:1},500).to({alpha:0.5},1000).to({alpha:1},1000);
				});
				//fade back in and close
				createjs.Tween.get(self.state.keypadWrap).wait(1000).to({alpha:0 }, 1500).call(function(){
						self.state.keyInputs.text.text = "";
						self.state.keyInputs.text.visible = false;
						self.state.keyInputs.text.alpha = 1;
						self.state.keyInputs.enter_code.visible = true;
						self.state.keyInputs.invalid.visible = false;
						self.state.keypadWrap.visible = false;
						
						//load level
						self.state.loadLvl(self.curEntrance);
						createjs.Tween.get(self.state.wrap).to({alpha:1 }, 2000).call(function(){
							self.state.paused = false;
						});
						
			}		);
			}

			//outside - check for keypads
			var globalPos = self.animation.localToGlobal(0,0);
			var outsidePos = self.state.outside.mapWrap.globalToLocal(globalPos.x,globalPos.y);
			console.log(globalPos, outsidePos);
			var intersects = self.state.outside.mapWrap.getObjectsUnderPoint(outsidePos.x,outsidePos.y);
			for(var i=0;i<intersects.length;i++){
				if(intersects[i].obj ){
					console.log("hit!",intersects[i].obj);
					self.curEntrance = intersects[i].obj;
					self.state.paused = true;
					createjs.Tween.get(self.state.wrap).to({alpha:0 }, 1500).call(function(){
						self.state.keypadWrap.alpha = 1;
						self.state.keypadWrap.visible = true;

			}		);
					break;
				}
			}

		}
	};



	this.onSpace = function(isMouseUp) {
		if(isMouseUp){
			this.holding_space = false;
			return;
		}

		if(this.isFiring) return; //already pew pewing
		this.pew();
	};

	this.pew = function(){
		var self = this;
		this.isFiring = true;
		createjs.Sound.play("laser2");
		this.animation.addEventListener("animationend", function(){ self.onanimationend(); });
		if(this.animation.currentAnimation == "walk" || this.animation.currentAnimation=="run" || this.animation.currentAnimation=="stand") this.animation.gotoAndPlay("shoot");
		else this.animation.gotoAndPlay("shoot_h");


        var s = this.bullet();
        // s.x = event.stageX;
        // s.y = event.stageY;
        s.x = 10;
        s.y = 10;
        this.bullets.push(s);
        this.game.stage.addChild(s);
	};


	this.bullet = function() {
        var s = new createjs.Shape();
        s.graphics.beginFill("#FF0000").drawCircle(0, 0, 10).endFill();
        return s;
    }


	this.onanimationend = function(){
		var self = this;
		if(!self.isFiring) return;
		//console.log("pew");
		//if(this.animation.currentAnimation != "shoot" && this.animation.currentAnimation != "shoot_h") return;
		this.isFiring = false;
		if(this.animation.currentAnimation == "shoot" ) this.animation.gotoAndPlay("stand");
		else this.animation.gotoAndStop("stand_h");
		
	}

	//@toDo remove this
	this.init();
}
