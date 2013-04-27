/*** map object - load tilesheet + generate map ***/

function Map(opts){
	this.data = null;
	this.tilesheet = null;
	this.map = null;
	this.opts =  {
		tile_width : 32,
		tile_height : 32,
	};
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
		this.mapData = data;
		for(var i=0;i<100;i++){
			this.mapData.layers[0].data[i] = 12;
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
		console.log(mapWidth, mapHeight);
		self.mapWrap.x = (mapWidth*self.opts.tile_width)/2;
		self.mapWrap.y = (mapHeight*self.opts.tile_height)/2;

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
		        
		        {
		         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0, 141, 0, 0, 58, 61, 53, 0, 0, 0, 0, 0, 0, 0, 54, 52, 52, 0, 0, 0, 0, 0, 0, 151, 0, 0, 0, 90, 89, 87, 0, 126, 0, 119, 118, 116, 0, 88, 101, 83, 0, 125, 0, 117, 115, 113, 0, 84, 82, 81, 0, 130, 122, 114, 112, 111, 0, 0, 0, 0, 0, 0, 128, 121, 0, 0, 0],
		         "height":10,
		         "name":"ground01",
		         "opacity":1,
		         "type":"tilelayer",
		         "visible":true,
		         "width":10,
		         "x":0,
		         "y":0,
		        }
		        
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