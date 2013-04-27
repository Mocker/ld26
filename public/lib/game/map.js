/*** map object - load tilesheet + generate map ***/

function Map(state, opts){
	this.state = state;
	this.data = null;
	this.tilesheet = null;
	this.map = null;
	this.decals = [];
	this.opts =  {
		tile_width : 32,
		tile_height : 32,
	};
	this.params = opts;
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
				height: this.opts.tile_height,
			}
		};
		this.tilesheet = new createjs.SpriteSheet(this.tilesheet_data);

	};


	//load map with provided obj
	//TODO:: need to generate map data dynamically
	// map structure will need to include layers for 32x32 and 64x64 images
	// and details for if the tiles are blocking/obstacles/etc
	// maybe couple layers for background non/blocking tiles, 
	this.loadMap = function(data) {
		var self = this;
		this.mapData = data;
		this.mapData.layers[0].height = this.params.height;
		this.mapData.layers[0].width = this.params.width;
		var x = Math.random();
		for(var i=0;i<(this.params.width*this.params.height);i++){
			x = Math.random();
			this.mapData.layers[0].data[i] = (x<0.8)?1:2;
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
					// create a new Bitmap for each cell
					var cellBitmap = new createjs.BitmapAnimation(self.tilesheet);
					// layer data has single dimension array
					var idxy = x + y * layerData.width;
					// tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
					cellBitmap.gotoAndStop(layerData.data[idxy]-1 );
					// isometrix tile positioning based on X Y order from Tiled
					//cellBitmap.x = 300 + x * tilewidth/2 - y * tilewidth/2;
					//cellBitmap.y = y * tileheight/2 + x * tileheight/2;

					//Square positioning
					cellBitmap.x = x*tilewidth;
					cellBitmap.y = y*tileheight;
					// add bitmap to map container
					self.mapWrap.addChild(cellBitmap);
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

	//handle map updates 
	this.handleTick = function(evt){

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