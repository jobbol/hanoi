/**** Description ******
GameKeys will safely get keys pressed inside a canvas element.

When the canvas has focus, game keys will not bubble-up to the browser.  This way pressing arrow keys
while in game will not cause the webpage to scroll around.  Any normal keyboard shortcuts will still work
as long as they are not a game key, such as pressing F5 or ctrl+t.

When focus is outside the canvas, all keys will behave normally.

This library is dependant on jQuery.



***** Parameters *******

keyArray
	an array containing string values of the keys to check for.  These strings must match names
	 inside prototype.keycode

canvas
	a string value for a css selector matching the canvas which receives key presses.  If this
	value is not provided all canvas elements will be matched.


return value
	an object containing true/false values of each checked key.




******** Usage **********

//Declaring 
var keys = new GameKeys( [ 'esc', 'left_arrow', 'right_arrow'] ,
                         '#canvas');


//Checking a key
if( keys['left_arrow'] ){
	player.x--;
}


*/





var GameKeys = function(keyArray, canvas){
	if(typeof jQuery === 'undefined'){
		console.log('jQuery must be loaded to use GameKeys. '+
			'See https://developers.google.com/speed/libraries/');
		return;
	}


	/*** Declarations ***/
	var r = this;

	r.list = keyArray || [];

	r.keyGet = {};
	r.keyHit = {};
	r.keyRead = {};
	r.list.forEach(function(obj){
		r.keyGet[obj] = false;
		r.keyRead[obj] = false;

		r.keyHit[obj+'_hit'] = function(){
			if(r.keyRead[obj] === false && r.keyGet[obj] === true){
				r.keyRead[obj] = true;
				return true;
			}
			return false;
		};

	});


	r.$canvas = $(canvas) || $('canvas');


	/*** Canvas Setup ***/
	$(canvas).attr('tabindex','0')
	         .css('outline-width','0px');


	/*** Events ***/
	r.events();


	return _.extend(r.keyGet, r.keyHit);
}



GameKeys.prototype.events = function(){
	var r = this;
	var $c = r.$canvas;


	$c.on('keydown', function(e){ //checks if a key was pressed inside canvas
		r.list.forEach(function(obj,i){
			if(r.keycode(obj) == e.keyCode) //this key is in our list
			{
				r.keyGet[obj] = true;
				e.preventDefault();

				//console.log('down', r.keycode(obj), r.keyGet);
			}
		});
	});


	$c.on('keyup', function(e){
		r.list.forEach(function(obj,i){
			if(r.keycode(obj) == e.keyCode)
			{
				r.keyGet[obj] = false;
				r.keyRead[obj] = false;
				e.preventDefault();

				//console.log('up', r.keycode(obj), r.keyGet);
			}
		});
	});
}





GameKeys.prototype.keycode = function(key){ //cost <= 1ms

	var KEYMAP = {
		strg: 17,
		ctrl: 17,
		ctrlright: 18,
		ctrlr: 18,
		shift: 16,
		'return': 13,
		enter: 13,
		backspace: 8,
		bcksp:8,
		alt: 18,
		altr: 17,
		altright: 17,
		space: 32,
		win: 91,
		mac: 91,
		fn: null,
		up: 38,
		down: 40,
		left: 37,
		right: 39,
		esc: 27,
		del: 46,
		f1: 112,
		f2: 113,
		f3: 114,
		f4: 115,
		f5: 116,
		f6: 117,
		f7: 118,
		f8: 119,
		f9: 120,
		f10: 121,
		f11: 122,
		f12: 123
	};


	var KEYCODES = {
		'backspace' : '8',
		'tab' : '9',
		'enter' : '13',
		'shift' : '16',
		'ctrl' : '17',
		'alt' : '18',
		'pause_break' : '19',
		'caps_lock' : '20',
		'escape' : '27',
		'page_up' : '33',
		'page down' : '34',
		'end' : '35',
		'home' : '36',
		'left_arrow' : '37',
		'up_arrow' : '38',
		'right_arrow' : '39',
		'down_arrow' : '40',
		'insert' : '45',
		'delete' : '46',
		'0' : '48',
		'1' : '49',
		'2' : '50',
		'3' : '51',
		'4' : '52',
		'5' : '53',
		'6' : '54',
		'7' : '55',
		'8' : '56',
		'9' : '57',
		'a' : '65',
		'b' : '66',
		'c' : '67',
		'd' : '68',
		'e' : '69',
		'f' : '70',
		'g' : '71',
		'h' : '72',
		'i' : '73',
		'j' : '74',
		'k' : '75',
		'l' : '76',
		'm' : '77',
		'n' : '78',
		'o' : '79',
		'p' : '80',
		'q' : '81',
		'r' : '82',
		's' : '83',
		't' : '84',
		'u' : '85',
		'v' : '86',
		'w' : '87',
		'x' : '88',
		'y' : '89',
		'z' : '90',
		'left_window key' : '91',
		'right_window key' : '92',
		'select_key' : '93',
		'numpad 0' : '96',
		'numpad 1' : '97',
		'numpad 2' : '98',
		'numpad 3' : '99',
		'numpad 4' : '100',
		'numpad 5' : '101',
		'numpad 6' : '102',
		'numpad 7' : '103',
		'numpad 8' : '104',
		'numpad 9' : '105',
		'multiply' : '106',
		'add' : '107',
		'subtract' : '109',
		'decimal point' : '110',
		'divide' : '111',
		'f1' : '112',
		'f2' : '113',
		'f3' : '114',
		'f4' : '115',
		'f5' : '116',
		'f6' : '117',
		'f7' : '118',
		'f8' : '119',
		'f9' : '120',
		'f10' : '121',
		'f11' : '122',
		'f12' : '123',
		'num_lock' : '144',
		'scroll_lock' : '145',
		'semi_colon' : '186',
		'equal_sign' : '187',
		'comma' : '188',
		'dash' : '189',
		'period' : '190',
		'forward_slash' : '191',
		'grave_accent' : '192',
		'open_bracket' : '219',
		'backslash' : '220',
		'closebracket' : '221',
		'single_quote' : '222'
	};
		var k = key.toLowerCase();
		return KEYMAP[k] || KEYCODES[k];
}