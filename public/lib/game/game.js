/** game.js 

  -core game loop for ld26 game

**/

function Game(canvasID, manifest) {

	this.canvasID = canvasID;
	var self = this;
	this.canvas = document.getElementById(canvasID);
	this.stage = new createjs.Stage(this.canvas);
	this.stage.mouseEventsEnabled = true;
	this.manifest = manifest;

	this.preloader = new createjs.LoadQueue(false);
	var preloader = this.preloader;
	preloader.installPlugin(createjs.SoundJS);
	preloader.onProgress = this.handleProgress;
	preloader.onComplete = this.handleComplete;
	preloader.onFileLoad = this.handleFileLoad;
	preloader.loadManifest(manifest);

	createjs.Ticker.setFPS(30);
	createjs.Ticker.addListener(this.stage);




	this.handleProgress = function(evt){
		//get percentage of loading
	};

	this.handleComplete = function(evt){
			//all loading complete
		console.log("finished loading");

	};
	this.handleFileLoad = function(evt){
		//individual file done loading
		console.log("file loaded",evt);
	};


	this.setupTitle = function(){
		//draw title and start preloader

		this.preloader.loadManifest(this.manifest);
	};


	//start game by initializing title screen

	this.setupTitle();
}