/**** playState.js 

handle main game loop, user interaction and events for Play State 


***/


function PlayState(game){
	this.game = game;
	this.map = undefined;
	this.player = undefined;
	this.outside = false; 
	this.levels = [];
	this.loaded = false;
	var self = this;


	this.init = function(){
		//generate outside map object
		var self = this;
		this.outside = new Map(self);
		this.outside.loadTiles(self.game.assets.img.tileset_temp2.tag);
		this.outside.loadMap(this.outside.dummyMap);
		this.outside.renderMap();

		self.game.stage.addChild(this.outside.mapWrap);

		//start by initiating player


	};

	this.handleTick = function(){

	};
}