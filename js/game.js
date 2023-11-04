/* game.js 
  gameplay screen.
*/

function ScreenGame(){


/*** Declarations, Etc. ***/
var block = [
	[],
	[],
	[]
];

var fire = {
	list: [],
	create: new Gcd({minSpeed: 200, maxSpeed: 1000}),
	decay: new Gcd({minSpeed: 300, maxSpeed: 500}),
	nightGrad: ctx.createLinearGradient(0,canvasEl.height,0,0),
	nightTimer: null,
	click: false,
};

fire.nightGrad.addColorStop(0,'orange');
fire.nightGrad.addColorStop(.2,'red');
fire.nightGrad.addColorStop(.4,'purple');
fire.nightGrad.addColorStop(.7,'black');


var selector = -1;
var flash = {
	select: 0,
	phase: 0,
	timer: null
}

var loop;

var win = {
	decay: null,
	timeTaken: null,
	movesTaken: null,
	par: Math.pow(2,game.set)-1
};


var startTime = null;
var moves = 0;


var bot = {
	move: [],
	index: 0,
	delay: new Gcd({speed: 300}),
};

//selector gradient
var grad = ctx.createLinearGradient(0,0,canvasEl.width,0);
var s = 1/3/5;
for(var i = 3; i--;){
	grad.addColorStop(i/3      ,'SkyBlue');
	grad.addColorStop(i/3 + s*1,'white');
	grad.addColorStop(i/3 + s*4,'white');

}
grad.addColorStop(3/3      ,'SkyBlue');




var button = new Button();
button.add({
	text: ' back',
	x: 40,
	y: canvasEl.height - 50,
	w: 100,
	inheritColor: true,
	f: returnToMenu,
});

var botControl = new Button();
[
	{
		text: botImg,
		frame: 3,
		f: function(){
			if(bot.delay.speed < 3000)
				bot.delay = new Gcd({speed: bot.delay.speed*1.5});
		}
	},
	{
		text: botImg,
		frame: 2,
		f: function(){
			if(bot.delay.speed > 10)
				bot.delay = new Gcd({speed: bot.delay.speed/1.5});
		}
	},

].forEach(function(obj, i){
	botControl.add({text: obj.text, f: obj.f, x: 105+ i*165, y: 70, w: 30, frame: obj.frame});
});





/*** Load Level ***/
var canvasPad = {x: 30, y: 20};

for(var i = 0; i < game.set; i++){
	block[0].push({
		size: game.set-i
	});
}






/********                  ********/
/*******   CPU Controlled   *******/
/********                  ********/

if(game.bot){
	moveTower(block[0].length-1, 0, 2, 1);
}





/*********                    *********/
/********      GAME LOOP       ********/
/*********                    *********/
$('#c').focus();
State.loop = setInterval(function(){

	cls();

	if(loader.ready()){

		/*** Updaters ***/
		if( gamekeys['esc'] )
			returnToMenu();
		muteButton.draw();

		
		//Solving tower still?
		if(!win.timeTaken){
			if(!game.bot)
				controller();
			else
				CPU();

			///Check if user has just won
			if(checkWin()){

				//Get user stats
				win.timeTaken = moment(moment() - startTime).format('mm:ss');
				win.movesTaken = moves;
				win.decay = new Gcd({speed:1000*15});



				//Disallow the bot from triggering high scores and win screen.
				if(!game.bot){

					//Cheer and start fireworks
					getBuzz('win').play();
					fire.nightTimer = new Gcd({speed: 3000});
					console.log(moment.duration(moment()-startTime).asSeconds());

					//Kongregate Statistics
					if(typeof kongregate != 'undefined'){
						if (game.set >= 8)
							kongregate.stats.submit("hardWin",true);
						else if (game.set >= 6)
							kongregate.stats.submit("mediumWin",true);
						else if (game.set >= 4)
							kongregate.stats.submit("easyWin",true);
						

						kongregate.stats.submit("tower"+game.set+"Timer",moment.duration(moment()-startTime).asSeconds() || 0 );
						kongregate.stats.submit("tower"+game.set+"Moves",win.movesTaken);
					}//kong

				}//no bot
			}


		//Win screen
		}else{
			//Draw fireworks screen
			ctx.fillStyle = 'maroon';
			if(!game.bot){
				drawFireCLS(); //fade in background
				drawFireworks();
			}

			//Back button
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			font('h3'); button.draw();

			//Win text
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			font('h1');
			if(win.decay){
				ctx.globalAlpha = 1-win.decay.until();
				ctx.fillText('Win',canvasEl.width/2,canvasEl.height/2);
				if(win.decay.ready()) win.decay = null;
				ctx.globalAlpha = 1;
			}
		}



		/*** Drawing ***/
		drawSelector();
		drawBlocks();
		drawTable();

		drawHUD();
		if(game.bot){
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			botControl.draw();
		}

		
	}//else

},1000/FPS); //setInterval





/*** Loop Helpers ***/
function drawBlocks(){


	block.forEach(function(col, x){
		col.forEach(function(obj, y){

			var draw = {
				x: canvasPad.x + (x * canvasEl.width/3 ),
				y: canvasEl.height - canvasPad.y - (y+1) * 10 * scale.y
			};

			loader.drawImage(blockImg, draw.x, draw.y, obj.size-1);
		});
	});
}



function drawTable(){
	ctx.fillStyle = 'maroon';
	ctx.fillRect(0, canvasEl.height-canvasPad.y, canvasEl.width, canvasPad.y);
}




function drawHUD(){
	var padTop = 10;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';

	function stat(name, value, x, y, value2){
		font('h2');
		ctx.fillText(name, x, y);
		font('h3');
		ctx.fillText(value, x, y+40);
		if(value2) ctx.fillText(value2, x, y+70);
	}
	

	if(win.timeTaken)
		ctx.fillStyle = 'limeGreen';
	else
		ctx.fillStyle = 'black';


	stat('Moves', win.movesTaken || moves, canvasEl.width - 200, padTop);

	stat( 'Time',
		   game.bot? (1000/bot.delay.speed).toFixed(2)+' m/s':
		  (!startTime) ? '--:--':
		  (win.timeTaken)  ? win.timeTaken:
		                 moment(moment() - startTime).format('mm:ss')
	      , 200, padTop);

}







function drawSelector(){

	//Drawing white selector
	var third = canvasEl.width/3;

	if(selector !== -1){
		ctx.fillStyle = grad;
		ctx.fillRect(third*selector, 0, third, canvasEl.height);	
	}

	//Drawing red flasher - for errors
	if(flash.timer !== null){
		ctx.fillStyle = 'rgba(230,150,150,'+(1-flash.timer.until())+')';

		if(flash.phase % 2 === 0) //draw on every other pulse
			ctx.fillRect(third*flash.select, 0, third, canvasEl.height);	

		if(flash.timer.ready())  //flip it when the timer is ready
			flash.phase++;

		if(flash.phase > 1){ //kill after x pulses
			flash.phase = 0;
			flash.timer = null;
		}
	}
}







function drawFireCLS(){

	if(fire.nightTimer !== null){
		ctx.globalAlpha = fire.nightTimer.until();
		if(fire.nightTimer.ready()) fire.nightTimer = null;
	}

	ctx.fillStyle = fire.nightGrad;
	ctx.fillRect(0,0,canvasEl.width,canvasEl.height);
	ctx.globalAlpha = 1;
}









function drawFireworks(){
	/*** Creation ***/
	var click = false;
	if(!mouse.click){
		fire.click = false;
	}
	if(mouse.click && !fire.click){
		fire.click = true;
		click = true;
	}

	if(fire.create.ready() || click === true){
		var obj = {
			x: _.random(0,canvasEl.width),
			y: _.random(0,canvasEl.height),

			spacer: _.random(5,30),
			power: _.random(5,10),
			
			c: {
				r: Math.floor(_.random(100,255)),
				g: Math.floor(_.random(100,255)),
				b: Math.floor(_.random(100,255))
			},
		};

		if(click){
			obj.x = mouse.x;
			obj.y = mouse.y;
		}


		for(var i = 0; i < 360; i+=obj.spacer)
		fire.list.push({
			x:  obj.x+Math.sin(i)*5,
			y:  obj.y+Math.cos(i)*5,
			vx: Math.sin(i)*obj.power*.7,
			vy: Math.cos(i)*obj.power*.7,
			size: obj.power,
			c: obj.c,
		});
	}
	var decay = fire.decay.ready();



	/*** Drawing ***/
	fire.list.forEach(function(obj){

		//draw
		ctx.globalAlpha = obj.size/10;
		ctx.fillStyle = 'rgb(' +obj.c.r+','+
			                   +obj.c.g+','+
			                   +obj.c.b+
			                ')';


		ctx.fillRect(obj.x,obj.y,obj.size,obj.size);
		//ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI*2);

		//physics
		obj.x+=obj.vx;
		obj.y+=obj.vy;
		obj.vy+=.1; //gravity

		if(decay){
			obj.size-=_.random(0,2);
		}
	});

	//Destroy
	if(fire.list.length > 0){
		for(var i = fire.list.length-1; i--;){
			if(fire.list[i].size <= 0)
				fire.list.splice(i, 1);
		};
	}


	ctx.globalAlpha = 1;
}









function returnToMenu(){
	State.push('menu');
	if(!(game.music === getBuzz('title')))
		game.music.fadeOut(2000, function(e){
			game.music.stop();
			game.music.setVolume(40);
			game.music = getBuzz('title').play();
		});
}





function controller(){

	if( gamekeys['z_hit']() ){ checkGameKeys(0); }
	if( gamekeys['x_hit']() ){ checkGameKeys(1); }
	if( gamekeys['c_hit']() ){ checkGameKeys(2); }

	for(var i = 3; i--;)
		if( mouse.x >= canvasEl.width/3*i && mouse.x < canvasEl.width/3*(i+1) && mouse.getClick())
			checkGameKeys(i);


	function checkGameKeys(keyHit){

		function setFlash(){
			flash.timer = new Gcd({speed: 370});
			flash.select = keyHit;
			getBuzz('perk2').play();
		}

		//1. Nothing is selected, make a selection
		if(selector === -1){

			if(block[keyHit].length === 0){ //disallow selecting an empty column
				setFlash();
				return;
			}

			selector = keyHit;
			return;
		}

		//2. We have a selection  
		else
		{
			//Targeting the same column, deselect
			if(selector === keyHit){
				getBuzz('perc').play();
				selector = -1;
				return;
			}


			//Targeting another column, move attempt
			if(   block[keyHit].length === 0 ||  //allow moving into empty stack
			    _(block[keyHit]).last().size > _(block[selector]).last().size ){ //allow moving a small onto larger piece

				//move block from selected stack to this stack
				var move = block[selector].pop();
				block[keyHit].push(move);
				moves++;
				getBuzz('perk').play();

				//start the timer if idle
				if(!startTime)
					startTime = moment();

			}


			//move attempt fail, user broke a rule
			else{
				setFlash();
			}
			selector = -1;

		}

	}//checkGameKeys
}//controller





function moveTower(height, fromPole, toPole, withPole){
	if(height === 0){
		moveDisk(height, fromPole, toPole);
		return;
	}

	//1. Move a tower of height-1 to an intermediate pole, using final pole.
	moveTower(height-1, fromPole, withPole, toPole);

	//2. Move the remaining disk to the final pole.
	moveDisk(height, fromPole, toPole);

	//3. Move the tower of height-1 from the intermediate pole to the final pole, using original pole.
	moveTower(height-1, withPole, toPole, fromPole);
}



function moveDisk(height, fromPole, toPole){
	bot.move.push({from: fromPole, to:toPole});
}






function CPU(){
	if(bot.delay.ready()){

		//Read the next move
		var move = bot.move[bot.index++];
		//bot.move.splice(0,1);

		var disk = block[move.from].pop(); //Take disk off source peg
		block[move.to].push(disk); //move disk onto destination peg

		
		//Update statistics
		moves++;
		if(!startTime)
			startTime = moment();
	}


}//CPU





function checkWin(){
	if(block[2].length === game.set){
		return true;
	}
	return false;
}


}//ScreenGame

