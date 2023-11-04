/* menu.js 
  Main menu screen.  The first screen visible to the user.
*/


function ScreenMenu(){

	var block = [
		[],
		[],
		[]
	];


	//Add buttons
	var button = new Button(muteButton);
	var x = canvasEl.width/2,
	    y = canvasEl.height/2;
	[
		{
			text:'Play',
			f: function(){
				game.bot = false;

				State.push('play');
				game.music.stop();
				getBuzz('menu').play()
				.bindOnce('ended', function(e){
					game.music = getBuzz('game-theme').play();
				});

			}
		},
		{
			text:'Watch',
			f: function(){
				game.bot = true;
				State.push('play');
			}
		},
		{
			text:'Help',
			f: function(){
				State.push('help');
				getBuzz('menu').play();
			}
		},
		{
			text:'About',
			f: function(){
				State.push('about');
				getBuzz('menu').play();
			}
		},
	]
	.forEach(function(btn){
		button.add({text:btn.text, x:x, y:y+=40, f:btn.f, w:170, px: 3});
	});

	x = 200;
	y = 200;
	[
		{
			text:'+',
			f: function(){
				if(game.set < game.max) game.set++;
				recalculateBlock();
				getBuzz('up').play();
			}
		},
		{
			text:'-',
			f: function(){
				if(game.set > 1) game.set--;
				recalculateBlock();
				getBuzz('down').play();
			}
		}
	].forEach(function(btn){
		button.add({text:btn.text, x:x+=3, y:y+=80, f:btn.f, w:40, px: 10, py: 20});
	});




	function recalculateBlock(){
		block[0] = [];
		for(var i = 0; i < game.set; i++)
			block[0].push({size: game.set-i});
	}

	//Load Level
	recalculateBlock();






	/*** Loop ***/
	State.loop = setInterval(function(){

		cls();

		drawBlocks();
		drawTable(game);
		drawThings();

	},1000/FPS);





	/*** Loop Helpers ***/
	function drawBlocks(){
		block[0].forEach(function(obj, y){
			var draw = {
				x: game.canvasPad.x,
				y: canvasEl.height - game.canvasPad.y - (y+1) * 10 * scale.y
			};

			loader.drawImage(blockImg, draw.x, draw.y, obj.size-1);
		});
	}


	function drawThings(){
		var x = canvasEl.width/2,
		    y = canvasEl.height/2,
		    par = Math.pow(2,game.set)-1;

		ctx.fillStyle = 'maroon';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		
		font('h1');		
		ctx.fillText('Hanoi', x, y);

		font('h3');
		button.draw();

		font('h5');
		ctx.fillStyle = 'Azure';
		y = canvasEl.height - 4;//canvasEl.height - game.canvasPad.y - (game.set+1) * 10 * scale.y;
		x = game.canvasPad.x;
		ctx.fillText('disks '+game.set, x, y);
		ctx.fillText('par '+par, x+150, y);
	}


}


/*********                 *********/
/********   About Screen    ********/
/*********                 *********/

function ScreenAbout(){
	//make tower
	var block = [];
	for(var i = 0; i < game.set; i++)
		block.push({size: game.set-i});

	//add buttons
	var button = new Button(muteButton);
	button.add({
		text: 'Okay',
		x: canvasEl.width/2,
		y: canvasEl.height - 80,
		w: 170,
		f: function(){
			State.push('menu');
			getBuzz('back').play();
		}
	});

 
	[
		{x:517,y:321, f: function(){ OpenInNewTab('http://www.freesound.org/people/lotterywinner/sounds/271013/');} },
		{x:542,y:241, f: function(){ OpenInNewTab('https://github.com/lobcog');} },
	].forEach(function(obj){
		button.add({
			text: externalImg,
			x: obj.x,
			y: obj.y+26,
			w: 33,
			f: obj.f
		});
	});


	//text setup
	ctx.fillStyle = 'maroon';
	ctx.textAlign = 'left';
	font('h3');

	//background gradient
	var grad = ctx.createLinearGradient(0, 0, canvasEl.width, canvasEl.height);
	grad.addColorStop(0, 'Cornsilk ');
	grad.addColorStop(1, 'DeepSkyBlue ');


	//etc...
	var y,
	    topMost;

	State.loop = setInterval( function(){
		clsGrad();

		y = 180; topMost = true;
		credit('a game ','Josh');
		credit('"Piano Classical Duo"','lotterywinner');


		drawTable();
		drawTower(blockImg);
		font('h3'); button.draw();
	},1000/FPS);



	/*** Loop Helpers ***/
	function drawTower(){
		block.forEach(function(obj, y){
			var draw = {
				x: game.canvasPad.x,
				y: canvasEl.height - game.canvasPad.y - (y+1)*10*scale.y
			};

			loader.drawImage(blockImg, draw.x, draw.y, obj.size-1);
		});
	}

	function credit(thing, person){
		ctx.fillStyle = 'maroon';
		ctx.textAlign = 'left';
		person = 'by ' + person;

		//What they did
		font('h5');
		ctx.fillText(thing, canvasEl.width/2, y+=50);

		//Who they are
		if(topMost){
			topMost = false;
			y+=5;
			font('h1');
			ctx.fillText(person, canvasEl.width/2, y+=36);
		}
		else{
			font('h4');
			ctx.fillText(person, canvasEl.width/2, y+=30);
		}

	}


	function clsGrad(){
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
	}

}






