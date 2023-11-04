/* main.js
   the entry point for the game, screen control, and loaders.
*/

/*********                    *********/
/********     Preprocessing    ********/
/*********                    *********/

/*** Context ***/
var canvasEl = document.getElementById('c');
var ctx = canvasEl.getContext('2d');
var FPS = 30;

//prevent antialiasing       //chrome complains about this one.
ctx.imageSmoothingEnabled = /*ctx.webkitImageSmoothingEnabled =*/ ctx.msImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.oImageSmoothingEnabled = false;


//global object
var game = {
	set: 6,
	max: 9,
	bot: false,
	soundReady: false,
	minimal: false,
	music: null,
	canvasPad: {x: 30, y: 20}
};


//Keyboard input
var gamekeys = new GameKeys(['z', 'x', 'c', 'esc'], '#c');




/*** Asset Loader ***/
var scale = {x: 4, y: 4};
var loader = new Loader();
var blockImg = loader.add('img/block.png',40,32,scale.x,scale.y);

var emptyImg = loader.add('img/empty.png',40,32,scale.x,scale.y);
var keyImg = loader.add('img/keys.png',14,16,scale.x,scale.y);
var slashImg = loader.add('img/slash.png',null,null,scale.x,scale.y);
var arrowImg = loader.add('img/arrow.png',null,null,6,6);
var clickImg = loader.add('img/click.png',15,22,scale.x,scale.y);

var externalImg = loader.add('img/external.png',null,null,2,2);
var botImg = loader.add('img/bot.png',14,14, 2, 2);
var soundImg = loader.add('img/sound.png',24,24,2,2);


/*** Sound Loader ***/

//Grabbing sounds from system.
var mpath = 'sound/';
var music = [
	{id:'title', src:'1906__nicstage__pianoloop.wav'},
	{id:'game-theme', src:'271013__lotterywinner__piano-classical-duo.ogg'},
	//{id:'', src:''}
];

var spath = 'sound/sfx/';
var soundFX = [
	{id:'up', src:'193231__b-lamerichs__eventsounds4-i.mp3'},
	{id:'down', src:'193237__b-lamerichs__eventsounds4-i3.mp3'},

	{id:'next', src:'193255__b-lamerichs__eventsounds4-k3.mp3'},
	{id:'back', src:'193252__b-lamerichs__eventsounds4-k3-reverse.mp3'},
	{id:'menu', src:'193248__b-lamerichs__eventsounds4-h.mp3'},

	{id:'perc', src:'222055__oceanictrancer__perc.wav'},
	{id:'perk', src:'250534__oceanictrancer__perk.wav'},
	{id:'perk2', src:'250536__oceanictrancer__perk2.wav'},
	{id:'win', src:'221568__alaskarobotics__cheering-and-clapping-crowd-1.mp3'},
	//{id:'', src:''},
];



/*** Load up sounds ***/
music.forEach(function(obj){
	obj.buzz = new buzz.sound(mpath+obj.src,{
		loop: true,
		volume: 40,
	});
});

soundFX.forEach(function(obj){
	obj.buzz = new buzz.sound(spath+obj.src);
});




//Function helper
function getBuzz(gd){
	var out = null;
	soundFX.some(function(obj){
		if(obj.id === gd){
			out = obj.buzz;
			return true;
		}
	});

	music.some(function(obj){
		if(obj.id === gd){
			out = obj.buzz;
			return true;
		}
	});


	return out;
}




//Play title screen music when ready.
game.music = getBuzz('title').bindOnce('canplaythrough',function(e){
	game.music.play();
});





var muteButton = new Button();
muteButton.add({
	text:soundImg,
	x: canvasEl.width-70,
	y: 50,
	f: toggleMute,
});



//Controls menu flow
var State = {

	/*** Private ***/
	loop: null,  //address pointing to the loop
	s: '',       //signal after push causes screen to change
	sub: '',     //stores loop inside loop
	stack: [],   //loop history, allows use of prev()


	/*** Public ***/
	push: function(menu){
		this.stack.push(menu);
		this.s = menu;
	},
	prev: function(){
		this.stack.pop();
		this.s = this.stack[this.stack.length - 1];
	}
};




/******                                                        *****/
/******                      MAIN LOOP                         *****/
/****** This loop controls each of the different game screens. *****/
/****** It checks for changes within the control variable and  *****/
/****** closes or opens the next screen.                       *****/
function Main(){
	State.push('load');
	var MAIN = setInterval(function(){


		if(State.s !== ''){ //this variable should be empty unless a screen change is needed.

			clearInterval(State.loop); //destroy previous loop

			//start the requested screen
			switch(State.s){ 
			case 'load':   ScreenLoad();     break;
			case 'menu':   ScreenMenu();     break;
			case 'play':   ScreenGame();     break;
			case 'help':   ScreenHelp();     break;
			case 'about':  ScreenAbout();    break;
			case 'kill':
				clearInterval(State.loop);
				clearInterval(MAIN);
				cls();
			}

			State.s = ''; //remove request
		}



	}, 1000/FPS);
}
Main();

function ScreenLoad(){
	var ab = 0;
	t = new Gcd({speed: 300});

	State.loop = setInterval(function(){
		if(loader.ready()){
			State.push('menu');
			return;
		}
		cls();
		
		var ellipsis = spliceSlice('...', 0, 2-loader.loaded%3);

		font('h3');
		ctx.fillStyle = 'maroon';
		ctx.textBaseline = 'middle';
		ctx.fillText( 'One moment'+ellipsis,
		              //horizontal center of the screen
			          canvasEl.width/2
			          //off set by only the text
			          -ctx.measureText('One moment').width/2,
			          //vertical center
			          canvasEl.height/2);

	},1000/FPS);
}




function cls(){
	ctx.fillStyle = 'Azure';
	ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
}



