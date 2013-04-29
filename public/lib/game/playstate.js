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
		this.alphamask = new createjs.Shape();
	// the mask's position will be relative to the parent of its target:
		mapWidth = this.game.width;
		mapHeight = this.game.height;
		//this.alphamask.x = mapWidth/2;
		//this.alphamask.y = mapHeight/2;
		//this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], this.mask.x, this.mask.y, 10, this.mask.x, this.mask.y, mapHeight/2);
		//this.alphamask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], 0, 0, 10, 0, 0, mapHeight/4);
		this.alphamask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 0.6], 0, 0, 10, 0, 0, mapHeight/4);
		
		this.mask.graphics.beginFill('#000000');
		this.mask.graphics.drawRect(0,0,mapWidth,mapHeight);
		this.alphamask.graphics.drawCircle(mapWidth/2,mapHeight/2,mapWidth/4).endFill();//drawRect(0,0,mapWidth,this.height).closePath();
		this.alphamask.alpha = 0.5;

		this.wrap.mask = this.mask;
		this.alphamask.cache(0,0,mapWidth,mapHeight);
		this.wrap.filters = [
			new createjs.AlphaMaskFilter(this.alphamask.cacheCanvas)
		];
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
				if(this.curmap && this.curmap.dudes && this.curmap.dudes.length >0){
					//console.log("move dudes");
					for(var i=0;i<this.curmap.dudes.length;i++){
						this.curmap.dudes[i].handleTick(evt);
					}

				}
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
		this.entrances = [null];
		var numEntrances = 6;
		var prevXY = [300,300];
		var entrance_imgs = [self.game.assets.img.front_entrance, self.game.assets.img.left_entrance, self.game.assets.img.right_entrance];
		for(var i=1;i<numEntrances;i++){
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
		
		
		self.curmap = this.outside;

		self.lvlwrap = new createjs.Container();

		self.lvlwrap.addChild(this.outside.mapWrap);
		self.wrap.addChild(self.lvlwrap);

		createjs.Sound.play("breathyTone1", "none",0,0,1,1,1);

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
		createjs.Sound.play("revup");
		if(self.curlvl==0){
			self.wrap.mask = self.alphamask;
			/*
			self.wrap.filters = [
				new createjs.AlphaMaskFilter(self.alphamask.cacheCanvas)
			];
			*/
		}
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
			var map2d = [];
			var digCallback = function(x,y,value){
				if(value){ return; }
				var key = x+","+y;
				var idx = x+y*map_w;
				if( map2d[x] == undefined) map2d[x] = [];
				map2d[x][y] = 14;
				keymap[key] = (value)?value:".";
				mapA[idx] = (value)?100:14 ; //tileid
				freecells.push(key);

			};
			digger.create(digCallback);
			var lvl= {
				lvl: lvl,
				keymap : keymap,
				tile_w : map_w,
				tile_h : map_h,
				map2d : map2d,
				digger : digger,
				mapA : mapA,
				freecells : freecells,
				rooms : digger.getRooms(),
				corridors : digger.getCorridors()
			};
			this.levels[lvlnum] = lvl;

			//go through rooms and corridors to set tiles
			//TODO:: not sure at all how these tiles go together
			var idx;
			var decalIt;
			for(var y=0;y<map_h;y++){
				for(var x=0;x<map_w;x++){
					idx = x+y*map_w;
					
					if( lvl.mapA[idx] !=14 ) continue;
					//console.log(x,y,idx,lvl.mapA[idx]);
					//check to set top tile

					if( !lvl.map2d[x][y-1] && lvl.map2d[x][y-2] != 14 ){
						if( lvl.map2d[x+1] && lvl.map2d[x+1][y-2] == 14){
							lvl.map2d[x][y-2] = 6;
							lvl.mapA[(x+(y-2)*map_w)] = 9;
						}
						else if( lvl.map2d[x-1] && lvl.map2d[x-1][y-2]==14){
							lvl.map2d[x][y-2] = 8;
							lvl.mapA[(x+(y-2)*map_w)] = 7;
						}
						else {
							lvl.map2d[x][y-2] = 9;
							lvl.mapA[(x+(y-2)*map_w)] = 13;
						}
					}

					//bottom
					if( !lvl.map2d[x][y+1] ){
						lvl.map2d[x][y+1] = 10;
						lvl.mapA[(x+(y+1)*map_w)] = 10;
					}		

					//right side
					if( lvl.map2d[x+1] && lvl.map2d[x+1][y] != 14 ){
						if(lvl.map2d[x+1][y-1] == 14 ){
							lvl.map2d[x+1][y] = 8;
							lvl.mapA[((x+1)+y*map_w)] = 8;
						}
						else if(lvl.map2d[x+1][y+1] == 14 ){
							lvl.map2d[x+1][y-1] = 7;
							lvl.mapA[((x+1)+(y-1)*map_w)] = 7;
						}
						else {
							lvl.map2d[x+1][y] = 11;
							lvl.mapA[((x+1)+y*map_w)] = 11;
						}
					}
					//left side
					if( lvl.map2d[x-1] && lvl.map2d[x-1][y] != 14 ){
						if(lvl.map2d[x-1][y-1] == 14 ){
							lvl.map2d[x-1][y] = 6;
							lvl.mapA[((x-1)+y*map_w)] = 6;
						}
						else if(lvl.map2d[x-1][y+1] == 14 ){
							lvl.map2d[x-1][y-1] = 9;
							lvl.mapA[((x-1)+(y-1)*map_w)] = 9;
						}
						else {
							lvl.map2d[x-1][y] = 12;
							lvl.mapA[((x-1)+y*map_w)] = 12;
						}
					}	

				}
			}

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

			//add decals
			var numDecals = Math.floor(Math.random()*25)+5;
			var decaledTiles = {};

			var ran;
			var decalImgs = [
				self.game.assets.img.scorchmark1.tag,
				self.game.assets.img.scorchmark2.tag,
				self.game.assets.img.scorchmark3.tag,
				self.game.assets.img.floorGrate.tag
			];
			var whichDecal;
			for(var i=0; i<numDecals;i++){
				ran = Math.floor(Math.random()*freecells.length);

				if(decaledTiles[ freecells[ran] ] != undefined) continue;
				var pos = freecells[ran].split(',');
				whichDecal = Math.floor(Math.random()*decalImgs.length);
				var bmp = new createjs.Bitmap(decalImgs[whichDecal]);
				bmp.x = pos[0]*32;
				bmp.y = pos[1]*32;
				lvl.map.mapWrap.addChild(bmp);
				lvl.map.decals.push(bmp);
				decaledTiles[ freecells[ran] ] = true;

			}

			//lets get some dudes
			lvl.map.dudes = [];
			var numDudes = Math.floor(Math.random()*4)+1;
			for(var i=0;i<numDudes;i++){
				var dude = new Enemy(self);
				ran = Math.floor(Math.random()*freecells.length)
				var pos = freecells[ran].split(',');
				dude.animation.x = pos[0]*32+15;
				dude.animation.y = pos[1]*32;
				dude.tileX = parseInt(pos[0]);
				dude.tileY = parseInt(pos[1]);
				//dude.animation.x = Math.floor(Math.random()*(map_w*32));
				//dude.animation.y = Math.floor(Math.random()*(map_h*32));
				dude.animation.gotoAndPlay("walk");
				lvl.map.dudes.push(dude);
				lvl.map.mapWrap.addChild(dude.enemyWrap);
				console.log("add dude",dude);
			}


			var pickPos = Math.floor(Math.random()*lvl.freecells.length);
			lvl.playerPos = lvl.freecells[pickPos];
			var pos = lvl.playerPos.split(",");
			pos[0] *= mapData.tilewidth;
			pos[1] *= mapData.tileheight;
			lvl.map.move(pos);

			self.curlvl = lvlnum;
			self.curmap = lvl.map;

			self.lvlwrap.addChild(lvl.map.mapWrap);

			createjs.Sound.play("creepyBG2", "none",0,0,1,1,1);
			
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