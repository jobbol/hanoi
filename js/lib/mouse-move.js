/* mousemove.js
 * Gets mouse x, y coordinates and saves to global mouse.x and mouse.y
 */
 
var mouse = {
	x: 0,
	y: 0,
	click: false,
	getClick: function(){
		if(this.click === true){
			this.click = false;
			return true;
		}
		return false;
	},
}
var canvas = document.getElementsByTagName('canvas')[0]; //breaks on multiple canvases, use getElementById instead.
var rect1 = canvas.getBoundingClientRect();


window.addEventListener('mousemove', getMousePos, false);
function getMousePos(evt) {
	var rect = canvas.getBoundingClientRect();

	mouse.x = evt.clientX - rect.left;
	mouse.y = evt.clientY - rect.top;
}

canvas.addEventListener('mousedown', function(evt){
	mouse.click = true;
	evt.preventDefault();
}, false);
canvas.addEventListener('mouseup', function(evt){
	mouse.click = false;
	evt.preventDefault();
}, false);
