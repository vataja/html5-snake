/**
 * @author Mikko Vataja
 */

var left=37;
var right=39;
var up=38;
var down=40;

//buffer for keypresses; this allows for several keypresses per tick
var keyBuffer = [];

var canvas = document.getElementById("canvas");
var W = canvas.width;
var H = canvas.height;

//amount of boxes per line
var sizeW = 40;
//amount of boxes per column 
var sizeH = 40;

var startingSize = 5;
var startingX = 5;
var startingY = 5;

var scaleX = W/sizeW;
var scaleY = H/sizeH;
var ctx = canvas.getContext("2d");

var direction = right;
var snake = [];
var dead = false;
var score = 0;
var curTime = 0;

//how many milliseconds does one tick take
var tickLength = 60;

var apple={};

function init() {
	keyBuffer = [];
	
	score = 0;
	direction = right;
	snake = [];
	var snakeElem={};
	snakeElem.x=startingX;
	snakeElem.y=startingY;
	for(var i = 0; i < startingSize; i++) {
		snake.push(snakeElem);
	}
	dead = false;
	
	newApple();
	
	paint();
	tick();
}

//keyhandling
document.body.onkeydown=function(evt){evt=evt?evt:window.event;
	var key = evt.keyCode;
	var dir = direction;
	if(key >= 37 && key <= 40) {
		if(keyBuffer.length > 0) {
			dir = keyBuffer[keyBuffer.length - 1];
		}
		if(    (key === left && dir !== right && dir !== left )
			|| (key === right && dir !== left && dir !== right)
			|| (key === up && dir !== down && dir !== up)
			|| (key === down && dir !== up && dir !== down)) {
			keyBuffer.push(key);
		} 
			
	}
	
	if(key === 13) {
		if(dead) {
			init();
		}
	}
};


init();


function newApple() {
	if(score === sizeW*sizeH - startingSize) {
		death();
		return;
	}
	randomizeApple();
	while(appleHitsSnake()) {
		randomizeApple();
	}
}

function randomizeApple() {
	apple.x = Math.floor(Math.random() * sizeW);
	apple.y = Math.floor(Math.random() * sizeH);
}

function appleHitsSnake() {
	for(var i = 0; i < snake.length; i++) {
		var el = snake[i];
		if(apple.x === el.x && apple.y === el.y) {
			return true;
		}
	}
	return false;
}


function tick() {
	if(!dead) {
		curTime = new Date().getTime();
		update();
		if(dead) {
			paintDead();
			return;
		}
		paint();

		var deltaTime = new Date().getTime() - curTime;
		var nextTime = tickLength - deltaTime;
		if(nextTime < 1) {
			nextTime = 1;
		}
		setTimeout(tick, nextTime)

	} else {
		paintDead();
	}
}

function paintDead() {
	drawBackground();
	var text = "You suck. "
	if(score === sizeW * sizeH - startingSize){
		text = "You won! "
	}
	text+=score+" ";
	if(score === 1) {
		text += "point.";
	}else{
		text += "points.";	
	}
	ctx.fillStyle = "#FF0000";
	ctx.font="20px Georgia";
	ctx.fillText(text, W/3, H/2.2);
	ctx.fillText("Press Enter to restart.", W/3-13, 2*H/3);
}

function paint() {
	drawBackground();
	paintApple();
	paintSnake();
	paintScore();
}

function paintScore() {
	ctx.fillStyle = "#FF0000";
	ctx.font="15px Georgia";
	var text = "Score: "+score;
	ctx.fillText(text, 11, 20);	
}

function drawBackground() {
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.rect(0, 0, W, H);
	ctx.closePath();
	ctx.fill();
}

function paintApple() {
	ctx.fillStyle = "#3333FF";
	ctx.beginPath();
	ctx.rect(apple.x * scaleX, apple.y * scaleY, scaleX, scaleY);
	ctx.closePath();
	ctx.fill();
}

function paintSnake() {
	for(var i = 0; i < snake.length; i++) {
		var elem = snake[i];
		
		//head with different color
		if(i === snake.length - 1) {
			ctx.fillStyle = "BBAA00";
		}
		else {
			ctx.fillStyle = "#AA3300";
		}
		ctx.beginPath();
		ctx.rect(elem.x * scaleX, elem.y * scaleY, scaleX, scaleY);
		ctx.closePath();
		ctx.fill();

		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.rect(elem.x * scaleX, elem.y * scaleY, scaleX, scaleY);
		ctx.closePath();
		ctx.stroke();

	}
}

function update() {
	updateDirection();
	updateSnake();
}

function updateDirection() {
	if(keyBuffer.length > 0) {
		direction = keyBuffer[0];
		keyBuffer.splice(0, 1);
	}	
}

function updateSnake() {
	var head = snake[snake.length - 1];
	var newhead = {};
	if(direction === left) {
		newhead.x = head.x - 1;
		newhead.y = head.y;
	} else if(direction === right) {
		newhead.x = head.x + 1;
		newhead.y = head.y;
	} else if(direction === up) {
		newhead.x = head.x;
		newhead.y = head.y - 1;
	} else if(direction === down) {
		newhead.x = head.x;
		newhead.y = head.y + 1;
	}

	var newA = false;
	if(newhead.x === apple.x && newhead.y === apple.y) {
		score++;
		newA = true;
	} else {
		snake.splice(0, 1);
	}

	//if snake hits the walls, death	
	if(newhead.x >= sizeW || newhead.x < 0 ||
           newhead.y >= sizeH || newhead.y < 0) {
		death();
	}
	
	//if snake hits itself
	for(var i = 0; i < snake.length - 1; i++) {
		var curElem = snake[i];
		if(newhead.x === curElem.x && newhead.y === curElem.y) {
			death();
		}
	}
	
	if(!dead) {
		snake.push(newhead);
		if(newA) {
			newApple();
		}
	}
}

function death() {
	dead = true;
}
