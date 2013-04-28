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
	this.paused = false;
	this.curlvl = 0;
	this.curmap = undefined;
	this.wrap = new createjs.Container();

	var self = this;

	this.opts = {
		outside_width: 40, 
		outside_height: 40
	};

	this.keyHandlers = { //callbacks for key events
		
	};

	this.init = function(){
		//generate outside map
		var self = this;
		this.loadOutside();

		//init player
		this.player = new Player(self);
		this.player.animation.x = this.game.width/2;
		this.player.animation.y = this.game.height/2;
		this.keyHandlers = {
			87 : function(up){ self.player.moveUp(up); },
			83 : function(up){ self.player.moveDown(up); },
			65 : function(up){ self.player.moveLeft(up); },
			68 : function(up){ self.player.moveRight(up); },
			13 : function(up){ self.player.enter(up); },
			32 : function(up){ self.player.onSpace(up); },
		};

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
			if(this.curlvl == 0 ){
				this.outside.handleTick(evt);
				//TODO:: place dudes handler inside map object
				if(this.outside.dudes && this.outside.dudes.length>0){
					for(var i=0;i<this.outside.dudes.length;i++){
						this.outside.dudes[i].handleTick(evt);
					}
				}
			} 
			else {
				//update current lvl
			}


		}
	};

	this.handleKeyDown = function(evt){
		if(this.paused && (evt.keyCode != 13)) return;
		var self = this;
		if(self.keyHandlers[evt.keyCode] ){
			self.keyHandlers[evt.keyCode](false);
		}
	};

	this.handleKeyUp = function(evt){
		if(this.paused) return;
		//console.log(evt.keyCode);
		if(self.keyHandlers[evt.keyCode] ){

			self.keyHandlers[evt.keyCode](true);
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
		this.outside.loadMap(this.outside.dummyMap, true);
		this.outside.renderMap();

		//place buildings
		this.entrances = [];
		var numEntrances = 6;
		var prevXY = [300,300];
		var entrance_imgs = [self.game.assets.img.front_entrance, self.game.assets.img.left_entrance, self.game.assets.img.right_entrance];
		for(var i=0;i<numEntrances;i++){
			//place entrances randomly increasingly further from spawn
			var x = Math.floor(Math.random()*200)+prevXY[0]+50;
			var y = Math.floor(Math.random()*200)+prevXY[1]+50;
			var dir = Math.floor(Math.random()*3);
			var entrance = {
				img: entrance_imgs[dir].tag,
				id : entrance_imgs[dir].id,
				x : x,
				y : y,
				bmp : new createjs.Bitmap(entrance_imgs[dir].tag)
			};
			entrance.bmp.x = x;
			entrance.bmp.y = y;
			entrance.bmp.obj = {
				type : 'entrance',
				lvl : i,
			};
			this.entrances.push(entrance);
			self.outside.mapWrap.addChild(entrance.bmp);
			prevXY = [x, y];
		}
		
		//lets get some dudes
		this.outside.dudes = [];
		var numDudes = Math.floor(Math.random()*4)+1;
		numDudes = 0;
		for(var i=0;i<numDudes;i++){
			var dude = new Enemy(self);
			dude.animation.x = Math.floor(Math.random()*1000);
			dude.animation.y = Math.floor(Math.random()*1000);
			dude.animation.gotoAndPlay("walk");
			this.outside.dudes.push(dude);
			this.outside.mapWrap.addChild(dude.enemyWrap);
		}

		self.curmap = this.outside;

		self.lvlwrap = new createjs.Container();

		self.lvlwrap.addChild(this.outside.mapWrap);
		self.wrap.addChild(self.lvlwrap);

		self.loadKeypad();
	};

	this.loadKeypad = function(){
		var self = this;

		this.keypadWrap = new createjs.Container();
		var keypadWrap = this.keypadWrap;

		this.keypadButtons = [
			new createjs.Rectangle(30,110,24,24),
			new createjs.Rectangle(5,40,24,20),
			new createjs.Rectangle(30,40,24,20),
			new createjs.Rectangle(55,40,24,20),
			new createjs.Rectangle(5,60,24,20),
			new createjs.Rectangle(30,60,24,20),
			new createjs.Rectangle(55,60,24,20),
			new createjs.Rectangle(5,80,24,20),
			new createjs.Rectangle(30,80,24,20),
			new createjs.Rectangle(55,80,24,20)
		];

		this.keypadButtons = [
			new createjs.Bitmap(self.game.assets.img.keypad_0.tag).set({x:30,y:110}),
			new createjs.Bitmap(self.game.assets.img.keypad_1.tag).set({x:5,y:40}),
			new createjs.Bitmap(self.game.assets.img.keypad_2.tag).set({x:30,y:40}),
			new createjs.Bitmap(self.game.assets.img.keypad_3.tag).set({x:55,y:40}),
			new createjs.Bitmap(self.game.assets.img.keypad_4.tag).set({x:5,y:60}),
			new createjs.Bitmap(self.game.assets.img.keypad_5.tag).set({x:30,y:60}),
			new createjs.Bitmap(self.game.assets.img.keypad_6.tag).set({x:55,y:60}),
			new createjs.Bitmap(self.game.assets.img.keypad_7.tag).set({x:5,y:80}),
			new createjs.Bitmap(self.game.assets.img.keypad_8.tag).set({x:30,y:80}),
			new createjs.Bitmap(self.game.assets.img.keypad_9.tag).set({x:55,y:80}),
		];
		for(var i=0;i<this.keypadButtons.length;i++){
			this.keypadButtons[i].char = i;
			//this.keypadButtons[i].visible = false;
			this.keypadButtons[i].addEventListener("click",function(evt){
				console.log("Keypad click",evt.target);
				self.keyInputs.text.text += evt.target.char;
				if(self.keyInputs.enter_code.visible){
					self.keyInputs.enter_code.visible = false;
					self.keyInputs.text.visible = true;
				}
			});
			keypadWrap.addChild(this.keypadButtons[i]);
		}

		
		var keypadBG = new createjs.Bitmap(self.game.assets.img.keypad.tag);
		//keypadBG.setTransform(0,0,2,2);
		//keypadBG.alpha = 0.8;
		keypadWrap.addChild(keypadBG);


		this.keyInputs = {
			'enter_code': new createjs.Bitmap(self.game.assets.img.keypad_entercode.tag).set({x:10, y:10}),
			'accepted' : new createjs.Bitmap(self.game.assets.img.keypad_accepted.tag).set({x:10, y:10, visible: false}),
			'invalid' : new createjs.Bitmap(self.game.assets.img.keypad_invalid.tag).set({x:10, y:10, visible: false}),
			'text' : new createjs.Text("","12px Courier New Bold","#000000").set({x:10,y:8,visible: false})
		};

		keypadWrap.addChild(this.keyInputs.enter_code, this.keyInputs.accepted, this.keyInputs.invalid);
		keypadWrap.addChild(this.keyInputs.text);

		keypadWrap.setTransform(0,0,2,2);

		

		keypadWrap.x = self.game.width/2 - 84;
		keypadWrap.y = self.game.height/2 - 140;
		keypadWrap.visible = false;
		self.game.stage.addChild(self.keypadWrap);
	};


	this.loadLvl = function(entrance){
		var self = this;
		console.log("load level ",entrance.lvl);
		var lvlnum = entrance.lvl;
		self.lvlwrap.removeChild(self.curmap.mapWrap);
		if(this.levels[entrance.lvl]==undefined){
			if(!this.lvlTiles) this.loadLvlTiles();
			//create the level
			ROT.RNG.setSeed(Date().toString());
			var map_w = Math.floor(Math.random()*20)+30;
			var map_h = Math.floor(Math.random()*20)+30;
			//if(!this.mapDebug) this.mapDebug = ROT.Display({fontSize:8});
			var digger = new ROT.Map.Digger(map_w, map_h);
			var keymap = {};
			var mapA = [];
			var freecells = []; 
			var digCallback = function(x,y,value){
				if(value){ return; }
				var key = x+","+y;
				var idx = x+y*map_w;
				keymap[key] = (value)?value:".";
				mapA[idx] = (value)?20:13 ; //tileid
				freecells.push(key);

			};
			digger.create(digCallback);
			var lvl= {
				lvl: lvl,
				keymap : keymap,
				tile_w : map_w,
				tile_h : map_h,
				digger : digger,
				mapA : mapA,
				freecells : freecells,
				rooms : digger.getRooms(),
				corridors : digger.getCorridors()
			};
			this.levels[lvlnum] = lvl;

			lvl.map = new Map(self, {
				width: map_w,
				height: map_h
			});
			var mapData = {
				height: map_h, 
				width: map_w,
				layers : [{
					data : lvl.mapA,
					height: map_h,
					width: map_w,
					visible : true,
					opacity : 1,
					type : "tilelayer",
					x : 0,
					y : 0,
					name : "ground00"
				}],
				orientation : "square",
				properties : {},
				tilesets : [],
				tileheight : 32,
				tilewidth : 32,
				version : 1,
			};
			lvl.map.tilesheet = self.lvlTiles;
			lvl.map.loadMap(mapData);
			lvl.map.renderMap();

			self.curlvl = lvlnum;
			self.curmap = lvl.map;

			self.lvlwrap.addChild(lvl.map.mapWrap);
			//go through rooms and corridors to set tiles
			//SHOW(this.mapDebug.getContaine());
		}
	};

	this.loadLvlTiles = function(){
		//load spritesheet for the level tiles
		
		var sprites = {
			images: [self.game.assets.img.tiles_sheet.tag],
			frames : [
				[198,0,19,30], //tiles_0000_dude 
				[0,81,32,32], //				tiles_0001_top-right-inside-coner 
				[33,81,32,32], //				tiles_0002_bottom-right-inside-coner 
				[66,81,32,32], //				tiles_0003_bottom-left-inside-conrer 
				[99,0,32,32], //				tiles_0004_top-left-inside-corner 
				[99,33,32,32], //				tiles_0005_top-right-outside-corner 
				[0,0,32,80], //				tiles_0006_bottom-left-outside-corner 
				[132,0,32,32], //				tiles_0007_top-left-outside-corner 
				[33,0,32,80], //				tiles_0008_bottom-right-outside-corner 
				[132,33,32,32], //				tiles_0009_bottom-side-wall 
				[99,66,32,32], //				tiles_0010_right-side-wall 
				[165,0,32,32], //				tiles_0011_left-side-wall 
				[66,0,32,80], //				tiles_0012_top-side-wall 
				[165,33,32,32], //				tiles_0013_ground 
			],
		};
		this.lvlTiles = new createjs.SpriteSheet(sprites);
		
	};



}