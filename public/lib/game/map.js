/*** map object - load tilesheet + generate map ***/

function Map(state, opts){
	this.state = state;
	this.game = this.state.game;
	this.data = null;
	this.tilesheet = null;
	this.map = null;
	this.decals = [];
	this.opts =  {
		tile_width : 32,
		tile_height : 32
	};
	this.offset = [0, 0]; //apply offset to children objects in order to rerender map tiles based on current view
	this.params = opts;

	this.tilePosition = {
		current : {x: 10, y: 10},
		max : { x: 21, y: 15 },
		min : { x: 0, y: 0}
	};

	this.cellBitmaps = []; //x,y array of bitmaps to make it easy to old ones

	console.log(this.params);
	this.loadTiles = function(img){
		var self= this;
		//img.width = img.width *2;
		//img.height = img.height * 2;
		document.body.appendChild(img);
		console.log("loadTiles",img,this.opts);
		this.tilesheet_img = img;
		this.tilesheet_data = {
			images : [img],
			frames : {
				width: this.opts.tile_width,
				height: this.opts.tile_height
			}
		};
		this.tilesheet = new createjs.SpriteSheet(this.tilesheet_data);

	};


	//load map with provided obj
	//TODO:: need to generate map data dynamically
	// map structure will need to include layers for 32x32 and 64x64 images
	// and details for if the tiles are blocking/obstacles/etc
	// maybe couple layers for background non/blocking tiles, 
	this.loadMap = function(data,randomize) {
		var self = this;
		this.mapData = data;
		this.mapData.layers[0].height = this.params.height;
		this.mapData.layers[0].width = this.params.width;
		var x = Math.random();
		if(randomize){
			for(var i=0;i<(this.params.width*this.params.height);i++){
				x = Math.random();
				this.mapData.layers[0].data[i] = (x<0.8)?1:2;
			}


			this.mapData.layers[0].grid = [];
			var ran, grid = [];
			for(x=0;x<this.params.width;x++){
				grid[x] = [];
				for(var y=0; y<this.params.height; y++){
					ran = Math.random();
					grid[x][y] = (ran<0.8)?1:2;
				}
			}
		}

		//create random decals
		if(this.params.decals){
			var dCount = Math.floor(Math.random()*(this.params.decals.max-this.params.decals.min))+this.params.decals.min;
			var y, d;
			var ds = this.params.decals.frames; //anim frames to choose which decal to place
			for(var i=0; i<dCount; i++){
				x = Math.floor(Math.random()*(this.params.width-2));
				y = Math.floor(Math.random()*(this.params.height-2));
				d = Math.floor(Math.random()*ds.length);
				self.decals.push({x:x,y:y,d:ds[d]});
			}
		}
	};

	//go through map and generate container to add to stage for drawing
	this.renderMap = function(){
		var self = this;
		var tilewidth = self.opts.tile_width, tileheight = self.opts.tile_height;
		tilewidth = self.mapData.tilewidth; tileheight = self.mapData.tileheight;

		self.mapWrap = new createjs.Container();
		self.bitmapWrap = new createjs.Container();
		self.mapWrap.addChild(self.bitmapWrap);
		var mapWidth = 0, mapHeight = 0;
		console.log(this.mapData.layers.length);
		//var idx = 0;
		for (var idx = 0; idx < this.mapData.layers.length; idx++) {
			//TODO:: it is only parsing the first layer even though length shows 2. I DONT NWO WHY
			var layerData = this.mapData.layers[idx];
			console.log("layer "+idx,layerData);
			if(layerData.height > mapHeight ) mapHeight = layerData.height;
			if(layerData.width > mapWidth ) mapWidth = layerData.width;
			for ( var y = 0; y < layerData.height; y++) {
				for ( var x = 0; x < layerData.width; x++) {
					
					// layer data has single dimension array
					var idxy = x + y * layerData.width;
					if(undefined==layerData.data[idxy] || layerData.data[idxy] < 0) continue;
					
					// create a new Bitmap for each cell
					var cellBitmap = new createjs.BitmapAnimation(self.tilesheet);
					// tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
					cellBitmap.gotoAndStop(layerData.data[idxy]-1 );
					// isometrix tile positioning based on X Y order from Tiled
					//cellBitmap.x = 300 + x * tilewidth/2 - y * tilewidth/2;
					//cellBitmap.y = y * tileheight/2 + x * tileheight/2;

					//Square positioning
					cellBitmap.x = x*tilewidth;
					cellBitmap.y = y*tileheight;
					// add bitmap to map container
					if(!self.cellBitmaps[x]) self.cellBitmaps[x] = [];
					if(self.cellBitmaps[x][y] ){ self.bitmapWrap.removeChild(self.cellBitmaps[x][y]); }
					self.cellBitmaps[x][y] = cellBitmap;
					self.bitmapWrap.addChild(self.cellBitmaps[x][y]);
					//self.mapWrap.addChild(cellBitmap);
					//@toDo: should render only canvas size map
				}
			}
			console.log("idx "+idx,this.mapData.layers.length);
		}
		for(var idx=0; idx<this.decals.length;idx++){
			var cellBitmap = new createjs.BitmapAnimation(self.tilesheet);
			var idxy = this.decals[idx].x + this.decals[idx].y * this.params.width;
			cellBitmap.gotoAndStop( this.decals[idx].d );
			cellBitmap.x = this.decals[idx].x*tilewidth;
			cellBitmap.y = this.decals[idx].y*tileheight;
			self.mapWrap.addChild(cellBitmap);
		}
		console.log(mapWidth, mapHeight);
		self.mapTileWidth = mapWidth;
		self.mapTileHeight = mapHeight;
		self.mapWidth = mapWidth * self.opts.tile_width;
		self.mapHeight = mapHeight * self.opts.tile_height;

		//self.mapWrap.x = (mapWidth*self.opts.tile_width)/2;
		//self.mapWrap.y = (mapHeight*self.opts.tile_height)/2;

		/*
		//create map mask
		this.mask = new createjs.Shape();
	// the mask's position will be relative to the parent of its target:
		mapWidth = mapWidth * this.opts.tile_width;
		mapHeight = mapHeight * this.opts.tile_height;
		console.log(mapWidth, mapHeight);
		this.mask.x = mapWidth/2;
		this.mask.y = mapHeight/2 - 120;
		this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], this.mask.x, this.mask.y, 10, this.mask.x, this.mask.y, mapHeight/2-150);
		//this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0.2, 1], 0, 0, 10, 0, 0, mapHeight/4);
		
		this.mask.graphics.drawCircle(mapWidth/2,mapHeight/2,mapWidth/2).endFill();//drawRect(0,0,mapWidth,this.height).closePath();
		this.mask.cache(0,0,mapWidth,mapHeight);
		this.mapWrap.filters = [
			new createjs.AlphaMaskFilter(this.mask.cacheCanvas)
		];
		this.mapWrap.cache(0,0,mapWidth,mapHeight);
		*/

	};


	this.loadTile = function(type) {
		var self = this;
		var tilewidth  = self.opts.tile_width;
		var tileheight = self.opts.tile_height;
		var layerData  = this.mapData.layers[0];
		var xD, yD, xD1, yD1;

		switch(type){
			case 'up':
				x0 = this.tilePosition.min.x - 1;
				x1 = this.tilePosition.max.x + 1;
				y0 = this.tilePosition.max.y;
				y1 = this.tilePosition.max.y + 2;

				xD = this.tilePosition.min.x - 1;
				xD1 = this.tilePosition.max.x + 1;
				yD = this.tilePosition.min.y - 6;
				yD1 = this.tilePosition.min.y -4;
				break;
			case 'down':
				x0 = this.tilePosition.min.x - 1;
				x1 = this.tilePosition.max.x + 1;
				y0 = this.tilePosition.min.y - 2;
				y1 = this.tilePosition.min.y;

				xD = this.tilePosition.min.x - 1;
				xD1 = this.tilePosition.max.x + 1;
				yD = this.tilePosition.max.y +4;
				yD1 = this.tilePosition.max.y + 6;
				break;
			case 'right':
				x0 = this.tilePosition.max.x;
				x1 = this.tilePosition.max.x + 2;
				y0 = this.tilePosition.min.y - 1;
				y1 = this.tilePosition.max.y + 1;

				xD = this.tilePosition.min.x - 6;
				xD1 = this.tilePosition.min.x -4;
				yD = this.tilePosition.min.y - 1;
				yD1 = this.tilePosition.max.y + 1;
				break;
			case 'left':
				x0 = this.tilePosition.min.x - 2;
				x1 = this.tilePosition.min.x;
				y0 = this.tilePosition.min.y - 1;
				y1 = this.tilePosition.max.y + 1;

				xD = this.tilePosition.max.x +4;
				xD1 = this.tilePosition.max.x + 6;
				yD = this.tilePosition.min.y - 1;
				yD1 = this.tilePosition.max.y + 1;
				break;
		}

		//console.log('Current x: ' + this.tilePosition.current.x + ' Max ' + this.tilePosition.max.x + ' Min ' + this.tilePosition.min.x);
		//console.log('Current y: ' + this.tilePosition.current.y + ' Max ' + this.tilePosition.max.y + ' Min ' + this.tilePosition.min.y);

		if(x0 <= -(self.mapTileWidth/2))
			x0 = -1*self.mapTileWidth/2;
		if(y0 <= 0)
			y0 = 0;
		if(x1 <= -(self.mapTileWidth/2))
			x1 = -1*self.mapTileWidht/2;
		if(y1 <= 0)
			y1 = 0;

		// lazy delete
		/*
		for (var x = 0; x <= tilewidth ; x++) {
			for (var y = 0; y <= tileheight ; y++) {
				if(x < x0 || x > x1) {
					if(y < y0 || y > y1) {
						var cellBitmap = new createjs.BitmapAnimation(self.tilesheet);
						var idxy = x + y * layerData.width;
						cellBitmap.gotoAndStop(layerData.data[idxy]-1);
						self.mapWrap.removeChild(cellBitmap);
					}
				}
			}
		}
		*/
		/*
		for (var x = xD; x <= xD1 ; x++) {
			for ( var y = yD; y <= yD1 ; y++) {
				if(self.cellBitmaps[x]==undefined || self.cellBitmaps[x][y]==undefined ) return;
				self.bitmapWrap.removeChild(self.cellBitmaps[x][y]);
				self.cellBitmaps[x][y] = undefined;
			}
		}
		*/

		for (var x = x0; x <= x1 ; x++) {
			if(x < 0) continue;
			if(x >= self.mapTileWidth) continue;
			for ( var y = y0; y <= y1 ; y++) {
				if(y<0) continue;
				if(y>=self.mapTileHeight) continue;
				if(self.cellBitmaps[x] && self.cellBitmaps[x][y] != undefined ) continue;
				var idxy = x + y * layerData.width;
				if(undefined==layerData.data[idxy] || layerData.data[idxy] < 0) continue;
				var cellBitmap = new createjs.BitmapAnimation(self.tilesheet);
				
				cellBitmap.gotoAndStop(layerData.data[idxy]-1);
				cellBitmap.x = x*tilewidth;
				cellBitmap.y = y*tileheight;
				if(!self.cellBitmaps[x]) self.cellBitmaps[x] = [];
				if(self.cellBitmaps[x][y] ){ self.bitmapWrap.removeChild(self.cellBitmaps[x][y]); }
				self.cellBitmaps[x][y] = cellBitmap;
				self.bitmapWrap.addChild(self.cellBitmaps[x][y]);
				//self.mapWrap.addChild(cellBitmap);
			}
		}

	};

	this.move = function(vel){
		//when player moves map wrapper shifts around player - 
		//check for collision if ok return true

		if(vel[0]==0&&vel[1]==0) return;

		if( 0 < this.mapWrap.x - vel[0] - this.game.width/2 ) return false;
		if( 0 < this.mapWrap.y - vel[1] - this.game.height/2 ) return false;
		if( this.mapWidth < (this.mapWrap.x - vel[0])*-1 + this.game.width/2) return false;
		if( this.mapHeight < (this.mapWrap.y - vel[1])*-1 + this.game.height/2 + 50) return false;

		var self       = this;
		var tilewidth  = self.opts.tile_width;
		var tileheight = self.opts.tile_height;

		this.mapWrap.x -= vel[0];
		this.mapWrap.y -= vel[1];

		 //console.log(this.mapWrap.x + ',' + this.mapWrap.y + '::' + vel[0] + '.' + vel[1]);
		// console.log(this.mapWrap.x + ':::::' + this.tilePosition.current.x + ' - ' + this.tilePosition.max.x + ' - ' + this.tilePosition.min.x);

		if (this.tilePosition.current.x > Math.floor(this.mapWrap.x*-1 / tilewidth)) {
			this.tilePosition.current.x = Math.floor(this.mapWrap.x*-1 / tilewidth);
			this.tilePosition.max.x--;
			this.tilePosition.min.x--;
			this.loadTile('left');
		} else if (this.tilePosition.current.x < Math.floor(this.mapWrap.x*-1 / tilewidth)) {
			this.tilePosition.current.x = Math.floor(this.mapWrap.x*-1 / tilewidth);
			this.tilePosition.max.x++;
			this.tilePosition.min.x++;
			this.loadTile('right');
		}

		if (this.tilePosition.current.y > Math.floor( (this.mapWrap.y)*-1 / tileheight)) {
			this.tilePosition.current.y = (Math.floor( (this.mapWrap.y)*-1 / tileheight) );
			this.tilePosition.max.y--;
			this.tilePosition.min.y--;
			this.loadTile('down');
		} else if (this.tilePosition.current.y < Math.floor( (this.mapWrap.y)*-1 / tileheight)) {
			this.tilePosition.current.y = Math.floor( (this.mapWrap.y)*-1 / tileheight);
			this.tilePosition.max.y++;
			this.tilePosition.min.y++;
			this.loadTile('up');
		}

		//self.state.wrap.updateCache(0,0,self.state.game.width,self.state.game.height);
		return true;
	};

	//move player to specific tile location
	this.moveToTile = function(tileX,tileY){

	};

	//handle map updates 
	this.handleTick = function(evt){
		//this.mapWrap.x += 1;
	};


	this.dummyMap =  { "height":10,
		 "layers":[
		        {
		         //"data":[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 39, 38, 36, 3, 4, 4, 4, 3, 3, 3, 37, 35, 33, 3, 4, 4, 4, 3, 3, 3, 34, 32, 31, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
		         "data":[],
		         "height":10,
		         "name":"ground00",
		         "opacity":1,
		         "type":"tilelayer",
		         "visible":true,
		         "width":10,
		         "x":0,
		         "y":0
		        }, 
		        /*
		        {
		         "data":[0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 4, 0, 0, 5, 8, 8, 0, 0, 0, 0, 141, 0, 0, 58, 61, 53, 0, 0, 0, 0, 0, 0, 0, 54, 52, 52, 0, 0, 0, 0, 0, 0, 151, 0, 0, 0, 90, 89, 87, 0, 126, 0, 119, 118, 116, 0, 88, 101, 83, 0, 125, 0, 117, 115, 113, 0, 84, 82, 81, 0, 130, 122, 114, 112, 111, 0, 0, 0, 0, 0, 0, 128, 121, 0, 0, 0],
		         "height":10,
		         "name":"ground01",
		         "opacity":1,
		         "type":"tilelayer",
		         "visible":true,
		         "width":10,
		         "x":0,
		         "y":0,
		        }
		        */
		        ],
		 "orientation":"square",
		 "properties":
		    {

		    },
		 
		 "tilesets":[
		        {
		         "firstgid":1,
		         "image":"forest.png",
		         "imageheight":1024,
		         "imagewidth":640,
		         "margin":0,
		         "name":"forest",
		         "properties":
		            {

		            },
		         "spacing":0,
		         "tileheight":64,
		         "tilewidth":64
		        }],
		 "tileheight":32,
		 "tilewidth":32,
		 "version":1,
		 "width":10
		};
}