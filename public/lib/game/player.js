/***

player.js

Player object to track metadata, interaction and graphics for the player character

***/


function Player(playstate) {
	this.state = playstate;
	this.game = playstate.game;
	this.name = "Bob";

	this.stats = {
		health : 100,
		movement : 1,
		conditions : [], //track status ailments?
	};

	this.inventory = [];

	//example structure for storing spritesheet and related animation data
	this.spritesheets = {
		player_anim : {
			image : 'player_anim', //match id loaded into assets from preloaded
			frames : { width: 16, height: 32 }, //width/height for each frame in this spritesheet
			animations : {
				stand: 1,
				run : [2,6],
				jump : [10,12],
			},
		}
	};


	this.handleTick = function(evt){

	};


	//go thorugh this.animation and load spritesheet from assets for each
	this.loadAnimations = function(){

	};

}