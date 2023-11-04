/* help.js 
  Help screen opened from the main menu.
*/


/*********                 *********/
/********    Help Screen    ********/
/*********                 *********/
function ScreenHelp(){


	//tower
	var block = [];
	var blockMin1 = [];
	var blockMin2 = [];

	for(var i = 0; i < game.set; i++){
		block.push({size: game.set-i});
		blockMin1.push({size: game.set-i});
		blockMin2.push({size: game.set-i});
	}

	blockMin1.pop();
	blockMin2.pop(); blockMin2.pop();


	//empty tower
	var empty = {
		show: true,
		timer: new Gcd({speed: 700})
	}

	var click = {
		seq: 0,

		x: 270,
		y: 320,
		vx: 0,

		t: new Date(),
		timer: new Gcd({speed: 500})
	}

	var key = {
		seq: 0,
		timer: new Gcd({speed: 500}),
		press: [0,0,0]
	};

	//current screen
	State.sub = 1;


	//Buttons
	var button = new Button(muteButton);

	var x = 240,
	    y = 270;
	[
		{
			text:'back',
			f: function(){
				getBuzz('back').play();
				if(State.sub===1)
					State.push('menu');
				else
					State.sub--;
			}
		},

		{
			text:'next',
			f: function(){
				getBuzz('next').play();
				if(State.sub===5)
					State.push('menu');
				else
					State.sub++;
			}
		}

	].forEach(function(btn){
		button.add({text:btn.text, x:x, y:y, f:btn.f, w:90, px: 10});
		x+=100;
	});



	

	/******        ******/
	/*****   Loop   *****/
	/******        ******/

	State.loop = setInterval(function(){
		cls();

		var x = 200;
		var y = 100;

		ctx.textBaseline = 'Alphabetic';
		ctx.fillStyle = 'maroon';
		ctx.textAlign = 'left';

		function write(text){
			ctx.fillText(text, x, y+=40);	
		}

		drawTable();


		/*** Per Screen ***/
		switch(State.sub){
		case 1:
			//left tower
			drawTower(blockImg, block, 0);

			//text in center
			font('h2');	write('Goal');
			font('h3'); write('move the tower to');
			            write('the right side.');

			//swaying arrow
			loader.drawImage(arrowImg, 250 + Math.sin(new Date()/200)*10, 300);

			//right tower
			if(empty.show)
				drawTower(emptyImg, block, 2);
			if(empty.timer.ready())
				empty.show = !empty.show;

			break;


		case 2:
			//left tower
			var t = new Date();
			drawTower(blockImg, blockMin1, 0);

			//floating block
			loader.drawImage(blockImg, game.canvasPad.x,
				//on the table
				canvasEl.height-game.canvasPad.y
				//on top of the tower
				-(block.length)*10*scale.y
				//and move it
				-Math.abs(Math.sin(t/200)*20) );



			//text in center
			font('h2'); write('Rule 1');
			font('h3'); write('Only move one disk');
			            write('at a time.');



			//right side floating block
			loader.drawImage(emptyImg,
				// centered        third peg
				game.canvasPad.x + 2*canvasEl.width/3,
				//on the table
				canvasEl.height-game.canvasPad.y
				//etc.
				-10*scale.y
				//and move it
				-Math.abs(Math.cos(t/200)*20) );
			break;


		case 3:
			//left tower
			var t = new Date();
			drawTower(blockImg, blockMin2, 0);

			//floating block
			loader.drawImage(blockImg, game.canvasPad.x,
				//on the table
				canvasEl.height-game.canvasPad.y
				//on top of the tower
				-(blockMin1.length)*10*scale.y
				//and move it
				-Math.abs(Math.sin(t/200)*20), 1);


			//text in center
			font('h2'); write('Rule 2');
			font('h3'); write('Never place a larger');
			            write('disk on a smaller one.');



			//right tower
			loader.drawImage(blockImg,
				// centered        third peg
				game.canvasPad.x + 2*canvasEl.width/3,
				//on the table
				canvasEl.height-game.canvasPad.y
				//etc.
				-10*scale.y);

			//right side floating block
			loader.drawImage(emptyImg,
				// centered        third peg
				game.canvasPad.x + 2*canvasEl.width/3,
				//on the table
				canvasEl.height-game.canvasPad.y
				//etc.
				-2*10*scale.y
				//and move it
				-Math.abs(Math.cos(t/200)*20), 1);

			//slashed block
			loader.drawImage(slashImg, 80 + 2*canvasEl.width/3,
				canvasEl.height-game.canvasPad.y
				-25*scale.y);

			break;


		case 4:
			y-=40;
			font('h2'); write('Controls');
			font('h3'); write('Click on a tower to ');
			            write('pick up a block.');
			            write('Click again to drop it.');


			function check(condition, f){
				f = f || function(){};

				if(condition){
					click.seq++;
					click.vx = 0;
					click.t = new Date();
					click.timer = new Gcd({speed: 1200});
					f();
					return true;
				}
				return false;
			}


			switch(click.seq){
			case 0: //slide left
				click.vx = -Math.abs(Math.sin((new Date()-click.t)/700)*10);
				drawBlock();

				check(click.x <= 100);
				break;


			case 1: //press
				click.press = 1;
				drawBlock(['floating']);

				check(click.timer.ready());
				break;


			case 2: //wait
				click.press = 0;
				drawBlock(['floating']);

				if(click.timer.ready()){
					click.seq++;
					click.press = 0;
					click.t = new Date();
				}
				break;


			case 3: //slide right
				click.vx = Math.abs(Math.sin((new Date()-click.t)/700)*10);
				drawBlock(['floating']);
				drawBlock(['right','empty']);

				check(click.x >= 500);
				break;


			case 4: //press again
				click.press = 1;
				drawBlock(['right']);

				check(click.timer.ready());
				break;


			case 5: //wait
				click.press = 0;
				drawBlock(['right']);

				if(check(click.timer.ready())){
					click.seq = 0;
					click.press = 0;
				}
				break;
			}


			click.x+=click.vx;
			loader.drawImage(clickImg, click.x, click.y, click.press);
			break;

		case 5:
			
			y-=40;
			font('h2'); write('Controls');
			font('h3'); write('You can also use');
			            write('Z, X, and C to pick')
			            write('up and drop blocks.');

			switch(key.seq){
			case 0: //down z
				drawBlock();
				key.press[0] = 1;
				break;
			case 1: //up z
			case 2:
				drawBlock(['floating']);
				key.press[0] = 0;
				break;
			case 3: //down c
				drawBlock(['floating']);
				drawBlock(['right','empty']);
				key.press[2] = 1
				break;
			case 4: //up c
				key.press[2] = 0;
			case 5:
			case 6:
				drawBlock(['right']);
				break;
			default:
				key.seq = 0;
			}

			if(key.timer.ready())
				key.seq++;


			for(var i = 3; i--;)
				loader.drawImage(keyImg, 50 + i*canvasEl.width/3, canvasEl.height-160, i*2+key.press[i]);

		}

		font('h4');
		button.draw();



	},1000/FPS);


	





	/*** Loop Helpers ***/
	function drawTower(img, tower, peg){
		tower.forEach(function(obj, y){
			var draw = {
				x: game.canvasPad.x + (peg * canvasEl.width/3 ),
				y: canvasEl.height - game.canvasPad.y - (y+1)*10*scale.y
			};

			loader.drawImage(img, draw.x, draw.y, obj.size-1);
		});
	}


	function drawBlock(list){
		list = list || [];
		function has(string){ return (list.indexOf(string) !== -1); }

		loader.drawImage( has('empty')? emptyImg : blockImg, game.canvasPad.x + (has('right')? 2*canvasEl.width/3:0) ,
			canvasEl.height-game.canvasPad.y
			-1*10*scale.y
			-has('floating') * Math.abs(Math.sin(new Date()/200)*20), 0);
	};



}