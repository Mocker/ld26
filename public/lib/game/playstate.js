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
	this.paused = true;
	this.curlvl = 0;
	this.wrap = new createjs.Container();

	var self = this;

	this.opts = {
		outside_width: 35, 
		outside_height: 35
	};

	this.init = function(){
		//generate outside map
		var self = this;
		this.loadOutside();

		//init player
		this.player = new Player(self);

		//create map mask
		this.mask = new createjs.Shape();
	// the mask's position will be relative to the parent of its target:
		mapWidth = this.game.width;
		mapHeight = this.game.height;
		//this.mask.x = mapWidth/2;
		//this.mask.y = mapHeight/2;
		//this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], this.mask.x, this.mask.y, 10, this.mask.x, this.mask.y, mapHeight/2);
		//this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], 0, 0, 10, 0, 0, mapHeight/4);
		this.mask.graphics.beginFill('#000000');
		this.mask.graphics.drawRect(0,0,mapWidth,mapHeight);
		//this.mask.graphics.drawCircle(mapWidth/2,mapHeight/2,mapWidth/2).endFill();//drawRect(0,0,mapWidth,this.height).closePath();
		this.wrap.mask = this.mask;
		//this.mask.cache(0,0,mapWidth,mapHeight);
		//this.wrap.filters = [
		//	new createjs.AlphaMaskFilter(this.mask.cacheCanvas)
		//];
		//this.wrap.cache(0,0,mapWidth,mapHeight);

		this.game.stage.addChild(this.wrap);

	};

	this.handleTick = function(evt){
		if(! this.paused ){
			if(this.player) this.player.handleTick(evt);
			if(this.curlvl == 0 ) this.outside.handleTick(evt);
			else {
				//update current lvl
			}


		}
	};



	this.loadOutside = function(){
		var self = this;
		this.outside = new Map(self, {
			width: self.opts.outside_width,
			height : self.opts.outside_height
		});
		//this.outside.loadTiles(self.game.assets.img.tileset_temp2.tag);
		var sprites = {
			images: [self.game.assets.img.tileset_moon.tag],
			frames : [
				//define individual frames to get different sized tiles
				[129,0,32,32],
				[129,33,32,32],
				[0,129,64,64],
				[0,0,128,128],
				[65,129,32,32],
				[65,162,16,16],
				[129, 66, 32, 32]
			],
		};
		this.outside.tilesheet = new createjs.SpriteSheet(sprites);
		this.outside.params.decals = {
			max:25,
			min:5,
			frames : [3,4,5,6]
		};
		this.outside.loadMap(this.outside.dummyMap);
		this.outside.renderMap();
		

		self.wrap.addChild(this.outside.mapWrap);
	};
}