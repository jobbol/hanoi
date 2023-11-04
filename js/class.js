/* class.js 
  Adds Button, ImageLoader, and Gcd classes.
  Adds misc functions.
*/



/*********                    *********/
/********  Class Button        ********/
/*********                    *********/

var Button = function(add){
	var add = add || {list:[]};
	this.list = [];
	var r = this;

	add.list.forEach(function(obj){
		r.list.push(obj);
	});
}


Button.prototype.add = function(get){
	this.list.push({
		text: get.text || '',
		frame: get.frame || 0,
		inheritColor: get.inheritColor || false,

		x: get.x || 0,
		y: get.y || 0,

		w: get.w || 20,

		px: get.px || 0,
		py: get.py || 0,
		f: get.f || function(){}
	});
}



Button.prototype.draw = function(){
	var r = this;
	var list = this.list;


	r.list.forEach(function(obj){
		if(typeof obj.text === 'object')
			loader.drawImage(obj.text, obj.x, obj.y-26, obj.frame);
		else
			ctx.fillText(obj.text, obj.x, obj.y); //Draw button


		var box = r.hover(obj);

		if(!obj.inheritColor)
			ctx.strokeStyle = 'maroon';
		else
			ctx.strokeStyle = ctx.fillStyle;

		if(box.hover)//Hover animation
			ctx.strokeRect(box.x, box.y, box.w, box.h);


		if(box.hover && mouse.getClick()){ //Click on button
			obj.f();
			if(obj.text === soundImg){
				if(obj.frame)
					obj.frame = 0;
				else
					obj.frame = 1;
			}
		}
	});
}



Button.prototype.hover = function(obj){

	var box = {   
		x: obj.x-obj.px,
		y: obj.y-obj.py,
		w: null,
		h: null,
		x2: obj.x + obj.w,  //HACK: hardcoded dimensions
		y2: obj.y + 38    + obj.py,
		hover: false
	};
	box.y  -=30||box.h/2;
	box.y2 -=30||box.h/2;

	if(obj.w === 20 && typeof obj.text === 'object'){
		box.x2 = obj.x + (box.w = obj.text.frame.w * obj.text.scale.w);
		box.y2 = obj.y + (box.h = obj.text.frame.h * obj.text.scale.h);
		box.h+=10;
	}else{
		box.w = box.x2 - box.x;
		box.h = box.y2 - box.y;
	}
	//box.h+=38;


	if( mouse.x >= box.x && mouse.x < box.x2 &&
	    mouse.y >= box.y && mouse.y < box.y2 ){
		box.hover = true;
	}

	

	return box;
}















/*********                    *********/
/********  Class Image Loader  ********/
/*********                    *********/

var Loader = function(){
	this.list = [];
	this.loaded = 0;
}

Loader.prototype.add = function(get, w, h, scalex, scaley){
	var ref = this;

	var obj = {
		frame:  { w: w, h: h},
		source: { w: null, h: null}, //changes within imagesLoaded()

		scale: { w: scalex || 1 , h: scaley || 1},
		dom: ($('<img>').attr('src',get))[0]
	};


	imagesLoaded(obj.dom, function(){ //not affected by an early fire.
		ref.loaded += 1;

		//console.log(obj.dom);
		//console.log('obj.source.w', obj.dom.width);
		//console.log('obj.source.h', obj.dom.height);

		obj.source.w = obj.dom.width;
		obj.source.h = obj.dom.height;
		obj.frame.w = obj.frame.w || obj.dom.width;
		obj.frame.h = obj.frame.h || obj.dom.height;


/*		ref.list.forEach(function(that,i){
			 ref[i] = obj;
		});
*/
		//console.log('ref['+String(obj.dom.src).slice(-10)+'] = ',obj);
		ref[obj] = obj;
	}); 


	this.list.push(obj);
	return obj;
}



Loader.prototype.ready = function(){
	return this.loaded === this.list.length;
}



Loader.prototype.drawImage = function(get, x, y, f){
	var img = null;
	f = f || 0;

	//1. Matching get to list object
	for( var i = this.list.length; i--;){
		if(this.list[i] === get){
			img = this.list[i];
			break;
		}
	}

	
	//2. Calculating frame
	var grid = {
		row:    img.source.w,
		height: img.source.h,

		w: img.frame.w,
		h: img.frame.h
	};

	var slice = {
		y: Math.floor(f / grid.row) * grid.h,
		x:           (f % grid.row) * grid.w
	};



	//3. Drawing list object
	if(img !== null)
		ctx.drawImage(
			img.dom,   //the image

			//source
			slice.x, slice.y,         //where on the image
			img.frame.w, img.frame.h, //size of this slice

			//destination
			x, y,                       //where on the canvas
			img.frame.w*img.scale.w,    //size of the drawing, scaled up
			img.frame.h*img.scale.h
		);
}


Loader.prototype.collision = function(obj1, img1, obj2, img2){
	//Box collision
	// Given A and B are both rectangles,
	// If B has at least one vertex inside A, Then A and B collide.
	// 
	//  ___________   _______   __________
	// |  B        | |   B   | |       B  |
	// |       ----|-|-------|-|----      | 
	// |      |x,y | |       | |    |     |
	// |______|____| |_______| |____|____ | 
	// _______|____             ____|_____
	// |      |    |           |    |     |
	// |  B   |    |     A     |    |  B  |
	// |______|____|           |___ |_____|
	// _______|____  ________   ____|_____
	// |      |   | |        | |w,h |     |
	// |      |___|_|________|_|____|     |
	// |  B       | |    B   | |       B  |
	// |__________| |________| |__________|
	
	var a = {
		x: obj1.x,
		y: obj1.y,
		w: obj1.x + this[img1].frame.w,
		h: obj1.y + this[img1].frame.h,
	};
	var b = {
		x: obj2.x,
		y: obj2.y,
		w: obj2.x + this[img2].frame.w,
		h: obj2.y + this[img2].frame.w,
	};

	if(( a.x<=b.x && b.x<a.w || b.x<=a.x && a.x<b.w ) &&
	   ( a.y<=b.y && b.y<a.h || b.y<=a.y && a.y<b.h )
	  ){
	  	console.log('hit');
		return true;
	  }
	 return false;
}











/*************            ***************/
/************ Class GCD    **************/
/*************            ***************/

var Gcd = function(get){
	var parent = this;

	this.speed =  get.speed || 0;
	this.minSpeed = get.minSpeed || this.speed;
	this.maxSpeed = get.maxSpeed || this.speed;

	this.t = new Date();
	this.m = {
		get speed(){return parent.speed},
		set speed(i){parent.speed = i},
	};

	if(this.minSpeed !== this.speed)
		this.randomize();
};

//time since last cooldown.
Gcd.prototype.last = function(){
	return this.t.getTime();
}

//returns true if the cooldown is off and resets it.
Gcd.prototype.ready = function(){
	var now = new Date();
	if(  this.last()+this.speed  <  now.getTime() ){
		this.t = now;
		this.randomize();
		return true;
	}
	return false;
}

//returns true if the cooldown is off.
Gcd.prototype.readySoft = function(){
	var now = new Date();
	if(  this.last()+this.speed  <  now.getTime() )
		return true;
	return false;
}

//Resets cooldown.
Gcd.prototype.reset = function(){
	this.t = new Date();
	this.randomize();
}

Gcd.prototype.randomize = function(){
	this.speed = _.random(this.minSpeed, this.maxSpeed);
}

//Returns a percent representing time until ready
Gcd.prototype.until = function(){
	var now = new Date();
	var out = (now.getTime()-this.last()) / this.speed;
	return (out<=1) ? out : 1;
}









/*** MISC Functions ***/
function font(tag){
	function f(tag){ctx.font = tag;}
	var name = '"Verdana"';//Verdana
	switch(tag){
		case 'h1': f("Bold 48px "+name); break;
		case 'h2': f("Bold 32px "+name); break;
		case 'h3': f("Bold 24px "+name); break;
		case 'h4': f("Bold 20px "+name); break;
		case 'h5': f("Bold 18px "+name); break;
		case 'p' : f("12px "+name); break;
		case 'p2': f("10px "+name); break;
	}
}


function drawTable(){
	ctx.fillStyle = 'maroon';
	ctx.fillRect(0, canvasEl.height-game.canvasPad.y, canvasEl.width, game.canvasPad.y);
}


function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function spliceSlice(str, index, count, add) {
	return str.slice(0, index) + (add || "") + str.slice(index + count);
}

function toggleMute(){
	game.mute = !game.mute;
	if(game.mute)
		buzz.all().mute();
	else
		buzz.all().unmute();
}
/*
function randomize(orig2){


	var orig = orig2;
	var output = "";

	while(orig.length > 0){
		var pick = getRandomInt(0,orig.length-1);

		output+=orig[pick];
		orig = spliceSlice(orig, pick, 1);
	}

	return output;
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}*/