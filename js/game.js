// Create the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var blobs = [];

var movePiece = function() {} 

setInterval(movePiece, 50);

var movesPerSecond = 100;
var resolution = 20;
var height = 0;
var width = 0;
height = Math.floor((document.documentElement.clientHeight * 0.75) / resolution);
width =  Math.floor((document.body.scrollWidth * 0.75) / resolution);

document.getElementById('canvas').height = (height * resolution);
document.getElementById('canvas').width = (width * resolution);

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
}, false);

function getRandomEntry(array) {
	var index = Math.floor(Math.random() * array.length);
	return array[index];
}

function isDebug() {
	return document.getElementById('debug').checked;
}

function drawBorderedRectangle(ctx, xPos, yPos, width, height, color = 'green', borderColor = '#000', borderThickness = 1)
{
	ctx.fillStyle = borderColor;
	ctx.fillRect(xPos, yPos, width, height);

	ctx.fillStyle = color;
	ctx.fillRect(xPos + borderThickness, yPos + borderThickness, resolution - 2 * borderThickness, resolution - 2*borderThickness);
}

var nextMove = 0;
var update = function (modifier) {
	if (nextMove <= Date.now()) {
		nextMove = Date.now() + (1/movesPerSecond) * 1000;
			blobs.forEach(function(e,i) {
			e.moveDown();
	});
	}
};

var blobTypes = ['Square', 'LBlob', 'TBlob', 'Iblob', 'XBlob'];
// var blobTypes = ['Iblob'];
var colors = ['#00f', '#0f0', '#0ff', '#f00', '#f0f', '#ff0'];
var createRandomBlob = function() {
	var blob = new window[getRandomEntry(blobTypes)]();
	blob.y = 0 - blob.getHeight();
	blob.x = Math.floor(Math.random() * width);
	blob.color = getRandomEntry(colors);
	blobs[blobs.length] = blob;
	if (isDebug()) {
		console.log('created Blob');
		console.log(blob.getAsText());
		console.log('width', blob.getWidth());
		console.log('height', blob.getHeight());
	}
}

var Blob = function() {
	var obj = {};

	obj.color = 'blue';
	obj.filledBlocks = [];
	obj.x = 0;
	obj.y = 0;

	obj.getHeight = function() {
		var minY = 0;
		var maxY = 0;

		this.filledBlocks.forEach(function(e, i) {
			if (e[1] < minY) {
				minY = e[0];
			}
			if (e[1] > maxY) {
				maxY = e[1];
			}
		});

		return maxY - minY + 1;
	}

	obj.getWidth = function() {
		var minX = 0;
		var maxX = 0;

		this.filledBlocks.forEach(function(e, i) {
			if (e[0] < minX) {
				minX = e[0];
			}
			if (e[0] > maxX) {
				maxX = e[0];
			}
		});

		return maxX - minX + 1;
	}

	obj.hasFilledBlock = function(x,y) {
		var hasBlock = false;
		this.filledBlocks.forEach(function(e, i) {
			if (e[0] == x && e[1] == y) {
				hasBlock = true;
			}
		});

		return hasBlock;
	}

	obj.getTouchedCoordinates = function() {
		var coordinates = [];
		this.filledBlocks.forEach(function(e, i) {
			coordinates[coordinates.length] = [e[0] + obj.x, e[1] + obj.y];
		});	

		return coordinates;
	}

	obj.touchesCoordinate = function(x, y) {
		var touches = false;
		var a = this;
		this.getTouchedCoordinates().forEach(function(e, i) {
			if ((e[0]) == x && (e[1]) == y) {
				touches = true;
			}
		});	

		return touches;
	}

	obj.getAllX = function(y) {
		var allX = [];
		obj.filledBlocks.forEach(function(e,i) {
			if (e[1] == y) {
				allX[allX.length] = e[0];
			}
		});
		return allX;
	}

	getMaxX = function(x) {
		var allX = this.getAllX();
		maxX = null;
		allX.forEach(function(e) {
			if (e > maxX) {
				maxX = e;
			}
		});

		return maxX;
	}
	
	obj.getAllY = function(x) {
		var allY = [];
		obj.filledBlocks.forEach(function(e,i) {
			if (e[0] == x) {
				allY[allY.length] = e[1];
			}
		});
		return allY;
	}

	obj.getMaxY = function(x) {
		var allY = this.getAllY(x);
		maxY = null;
		allY.forEach(function(e) {
			if (e > maxY || null === maxY) {
				maxY = e;
			}
		});

		return maxY;
	}
	
	obj.getAsText = function() {
		var height = this.getHeight();
		var text = '';
		for (var y = 0; y < height; y++) {
			for (var i = 0; i < this.getWidth(); i++) {
				if (this.getAllX(y).indexOf(i) == -1) {
					text += '0';
				} else {
					text += 'X';
				}
			}
			text += "\n";
		}

		return text;
	}

	obj.render = function(ctx) {
		var a = this;
		this.getTouchedCoordinates().forEach(function(e,i) {
			var x = (e[0]) * resolution;
			var y = (e[1]) * resolution;
			drawBorderedRectangle(ctx, x, y, resolution, resolution, a.color);
		});
	}

	obj.split = function() {
		var newBlobs = [];
		var a = this;
		this.filledBlocks.forEach(function(e,i) {
			var newBlob = new StoppedBlob();
			newBlob.x = a.x + e[0];
			newBlob.y = a.y + e[1];
			newBlob.filledBlocks = [[0,0]];
			newBlob.color = a.color;
			// newBlob.color = getRandomEntry(colors);

			newBlobs[newBlobs.length] = newBlob;
		});

		this.filledBlocks = [];

		return newBlobs;
	}

	return obj;
}

var StoppedBlob = function() {
	var obj = new Blob();
	obj.nextMove = Date.now() * 1000;
	obj.moveDown = function() {return false;};
	return obj;
}

var MovingBlob = function() {
	var obj = new Blob();
	obj.nextMove = Date.now();
	obj.moveDown = function() {
		var now =  Date.now();
		this.y += 1;
		this.nextMove = now + (1000/movesPerSecond);
		var maxYs = [];
		var touches = false;

		for (var i = 0; i < blobs.length; i++) {
			var blob = blobs[i];
			if (blob == this) {
				continue;
			}

			for (var w = 0; w < this.getWidth(); w++) {
				if (blob.touchesCoordinate(w + this.x, this.getMaxY(w) + this.y + 1)) {
					touches = true;
				}
			}
		}

		if (((this.y + this.getHeight())  == height) || touches) {
			createRandomBlob();

			var newBlobs = this.split();
			newBlobs.forEach(function(e,i) {
				blobs[blobs.length] = e;
			});
			blobs.splice(blobs.indexOf(this), 1);
		}
	}

	return obj;
}

var Square = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0], [0,1], [1,0], [1,1]];

	return obj;
}

var LBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0], [0,1], [0,2], [1,2]];
	return obj;
};

var Iblob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0], [0,1], [0,2], [0,3], [0,4]];
	return obj;
}

var MiniBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0]];
	return obj;
}

var TBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[1,0], [0,1], [1,1], [2,1]];
	return obj;
}

var XBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0], [2,0], [1,1],  [0,2], [2,2]];
	return obj;
}

var render = function () {
        ctx.fillStyle = "blue";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		blobs.forEach(function(e,i) {
			e.render(ctx);
		});
};

// The main game loop
var main = function () {
		if (document.getElementById('pause').checked) {
			return;
		}
        var now = Date.now();
        var delta = now - then;
		update(delta / 1000);

		render();
        then = now;
};
// Let's play this game!
var then = Date.now();
setInterval(main, 50); // Execute as fast as possible