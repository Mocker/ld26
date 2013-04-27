/** game.js 

  -core game loop for ld26 game

**/

function Game(canvasID, manifest) {

	this.canvasID = canvasID;
	var self = this;
	this.canvas = document.getElementById(canvasID);
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.stage = new createjs.Stage(this.canvas);
	this.stage.mouseEventsEnabled = true;
	this.manifest = manifest;

	//create stage mask
	/*
	this.mask = new createjs.Shape();
	// the mask's position will be relative to the parent of its target:
	this.mask.x = this.width/2;
	this.mask.y = this.height/2;
	//TODO-alpha mask not working, should fade out on edges instead of hard mask
	this.mask.graphics.beginRadialGradientFill(["#000000", "rgba(0,0,0,0)"], [0, 1], this.width/2, this.height/2, 0, this.width/2, this.height/2, this.width/2);
	this.mask.graphics.drawCircle(0,0,this.width/2).endFill();//drawRect(0,0,this.width,this.height).closePath();
	this.mask.cache(0,0,this.width,this.height);
	//this.stage.mask = this.mask;
	this.stage.filters = [
		new createjs.AlphaMaskFilter(this.mask.cacheCanvas)
	];
	//this.stage.cache(0,0,this.width,this.height);
	*/
	this.assets = {img:{},sound:{} };

	createjs.Ticker.addEventListener("tick", handleTick);
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addListener(this.stage);

	this.states = {
		'title' : {},
		'play' : {},
		'pause' : {}
	};


	self.handleProgress = function(evt){
		//get percentage of loading
		if(this.state =="title"){
			this.states.title.status.text = "Loading your browser with fun .. "+parseInt(evt.loaded*100)+"%";
		}
	};

	self.handleComplete = function(evt){
			//all loading complete
		var self = this;
		console.log("finished loading",self.state);
		if(self.state=="title"){
			//loading done fade out title and play
			createjs.Tween.get(this.states.title.wrapper).wait(200).to({alpha:0, visible:false}, 1000).call(function(){
				console.log("switch to play state");
				self.stage.removeChild(self.states.title.wrapper);
				self.setupPlay();
			});
		}

	};
	self.handleFileLoad = function(evt){
		//individual file done loading
		var self = this;
		console.log("file loaded",evt,this);
		switch(evt.item.type){
			case "image":
				self.assets.img[evt.item.id] = evt.item;
				break;
			default :
				self.assets.sound[evt.item.id] = evt.item;
		}
	};

	this.handleTick = function(evt) {
		//pass to state manager
		if(this.state == "play" && this.states.play){
			this.states.play.handleTick(evt);
		}
	};

	this.setupTitle = function(){
		//draw title and start preloader
		var self = this;
		this.state = "title";
		this.states.title.wrapper = new createjs.Container();
		this.states.title.title = new createjs.Text("256 Shades of Gray","40px Comic Sans","#cccccc");
		this.states.title.title.x = this.width/2 - 250;
		this.states.title.title.y = 50;
		this.states.title.wrapper.addChild(this.states.title.title);

		var status = new createjs.Text("Loading your browser with fun .. 0%","20px Comic Sans","#ccffcc");
		status.x = this.width/2-250;
		status.y = 200;
		this.states.title.status = status;
		this.states.title.wrapper.addChild(this.states.title.status);

		this.stage.addChild(this.states.title.wrapper);


		this.preloader = new createjs.LoadQueue(false);
		var preloader = this.preloader;
		preloader.installPlugin(createjs.SoundJS);
		preloader.addEventListener("progress", function(evt){ self.handleProgress(evt); });
	    preloader.addEventListener("complete", function(evt){ self.handleComplete(); }  );
	    preloader.addEventListener("fileload", function(evt){ self.handleFileLoad(evt); } );
		this.preloader.loadManifest(this.manifest);
	};


	this.setupPlay = function(){
		//start up play state and start passing events to it
		console.log("play!");
		this.states.play = new PlayState(game);
		this.states.play.init();
		this.state = "play";
		this.canvas.className = "";

	};


	//start game by initializing title screen

	this.setupTitle();
}