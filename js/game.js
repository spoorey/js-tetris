// Create the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var blobs = [];
var nextBlobId = 1;

function movesPerSecond() {
	return parseInt(document.getElementById('movesPerSecond').value);
}

function horizontalMovesPerSecond() {
	return movesPerSecond() * 5;
}

var nextMove = 0;
var nextHorizontalMove = 0;

var rotateActive = true;
var resolution = 30;
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

var update = function (modifier) {
	if (!keysDown[38]) {
		rotateActive = true;
	}

	if (keysDown[38] && rotateActive) {
		blobs.forEach(function(blob, i) {
			blob.rotate();
		});

		rotateActive = false;
	}

	if (keysDown[40]) {
		nextMove = nextHorizontalMove;
	}

	if (nextHorizontalMove <= Date.now()) {
		// 37 = left; 39 = right; 40= down; 38=up
		nextHorizontalMove = Date.now() + (1000/horizontalMovesPerSecond());
		if (keysDown[37]) {
			blobs.forEach(function(blob, i) {
				blob.moveLeft();
			});
		}
		if (keysDown[39]) {
			blobs.forEach(function(blob, i) {
				blob.moveRight();
			});
		}
	}
	if (nextMove <= Date.now()) {
		nextMove = Date.now() + (1/movesPerSecond()) * 1000;
			blobs.forEach(function(e,i) {
			e.moveDown();
		});

		for (var i = height - 1; i >= 0; i--) {
			checkFullLine(i);
		}
	}
};

var blobTypes = ['Square', 'LBlob', 'TBlob', 'Iblob', 'JBlob'];
var colors = ['#00f', '#0f0', '#0ff', '#f00', '#f0f', '#ff0'];
var createRandomBlob = function() {
	var blob = new window[getRandomEntry(blobTypes)]();
	blob.y = 0 - blob.getHeight();
	blob.x = Math.floor(Math.random() * (width - blob.getWidth() + 1));
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
	obj.type = 'blob'; 
	obj.filledBlocks = [];
	obj.x = 0;
	obj.y = 0;
	obj.id = nextBlobId ++;

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
			if (e > maxY) {
				maxY = e;
			}
		});
	
		return maxY;
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

	obj.getMaxX = function(y) {
		var allX = this.getAllX(y);
		maxX = null;
		allX.forEach(function(e) {
			if (e > maxX || maxX == null) {
				maxX = e;
			}
		});

		return maxX;
	}
	
	obj.getMinX = function(y) {
		var allX = this.getAllX(y);
		minX = null;
		allX.forEach(function(e) {
			if (e < minX || minX == null) {
				minX = e;
			}
		});

		return minX;
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
			newBlob.color = a.color;

			newBlobs[newBlobs.length] = newBlob;
		});

		this.filledBlocks = [];

		return newBlobs;
	}

	return obj;
}

var StoppedBlob = function() {
	var obj = new Blob();
	obj.type = 'stopped';
	obj.nextMove = Date.now() * 1000;
	obj.moveDown = function() {return false;};
	obj.moveLeft = function() {return false;};
	obj.moveRight = function() {return false;};
	obj.rotate = function() {return false;};
	obj.filledBlocks = [[0,0]];
	return obj;
}

var MovingBlob = function() {
	var obj = new Blob();
	obj.nextMove = Date.now();
	obj.moveLeft = function() {
		if (this.x < 1) {
			return false;
		}

		var freeSpace = true;

		var leftCoordinates = [];
		for (w = 0; w < this.getHeight(); w++) {
			var x = this.getMinX(w);
			if (null !== x && x >= 0 && this.x >= 1) {
				leftCoordinates[w + this.y] = this.x + x - 1;
			}
		}

		var a = this;
		leftCoordinates.forEach(function(x, y)  {
			var blob = getBlobTouchingCoordinate(x, y);
			if (null != blob && a != blob) {
				freeSpace = false;
			}
		});

		if (freeSpace) {
			this.x -= 1;
		}
	}
	obj.moveRight = function() {
		if ((this.x + this.getWidth()) >= width) {
			return false;
		}
	
		var freeSpace = true;

		var rightCoordinates = [];
		for (w = 0; w < this.getHeight(); w++) {
			var x = this.getMaxX(w);
			if (null !== x && x >= 0 && this.x >= 1) {
				rightCoordinates[w + this.y] = this.x + x + 1;
			}
		}

		var a = this;
		rightCoordinates.forEach(function(x, y)  {
			var blob = getBlobTouchingCoordinate(x, y);
			if (null != blob && a != blob) {
				freeSpace = false;
			}
		});

		if (freeSpace) {
			this.x += 1;
		}
	}

	obj.moveDown = function() {
		var now =  Date.now();

		this.nextMove = now + (1000/movesPerSecond());
		var maxYs = [];
		var touches = false;

		var blob = this.getBlobRightBelow();
		var touches = (blob != null && blob.id != this.id);

		if (((this.y + this.getHeight())  == height) || touches) {
			createRandomBlob();

			var newBlobs = this.split();
			newBlobs.forEach(function(e,i) {
				blobs[blobs.length] = e;
			});
			blobs.splice(blobs.indexOf(this), 1);
		} else {
			this.y += 1;
		}
	}

	obj.rotate = function() {
		var oldBlocks = this.filledBlocks;
		var newBlocks = [];
		var a = this;
	
		oldBlocks.forEach(function(e) {
			newBlocks[newBlocks.length] = [a.getHeight() - e[1] - 1, e[0]];
		});
	
		this.filledBlocks = newBlocks;
		var validRotate = true;
		this.getTouchedCoordinates().forEach(function(c) {
			var x = c[0];
			var y = c[1];
			var blob = getBlobTouchingCoordinate(x, y);
			if (blob != null && blob.id != a.id) {
				validRotate = false;
				return;
			}

			if (x >= width || y >= height || x < 0) {
				validRotate = false;
				return;
			}
		});

		if (!validRotate) {
			this.filledBlocks = oldBlocks;
		}
	}

	obj.getBlobRightBelow = function() {
		var blob = null;
		for (var w = 0; w < this.getWidth(); w++) {
			var e = getBlobTouchingCoordinate(w + this.x, this.getMaxY(w) + this.y + 1);
			if (null != e && this != e) {
				blob = e;
			}
		}

		return blob;
	}

	return obj;
}

function getBlobTouchingCoordinate(x, y) {
	var blob = null;
	blobs.forEach(function(e, i) {
		if (e.touchesCoordinate(x, y)) {
			blob = e;
			return;
		}
	});

	return blob;
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

var JBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[1,0], [1,1], [1,2],  [0,2]];
	return obj;
}

var OneBlob = function() {
	var obj = new MovingBlob();
	obj.filledBlocks = [[0,0]];
	return obj;
}

var timeOutActive = false;
function checkFullLine(y) {
	if (timeOutActive) {
		return;
	}

	var floorBlobs = [];
	var floorFilled = true;
	for (i = 0; i < width; i++) {
		var floorBlob = getBlobTouchingCoordinate(i, y);
		if (floorBlob && floorBlob.type ==  'stopped') {
			floorBlobs[floorBlobs.length] = floorBlob;
		} else {
			floorFilled = false;
			break;
		}
	}

	var moveBlobs = [];
	blobs.forEach(function(blob) {
		if (floorFilled && blob.type == 'stopped' && blob.y < (y)) {
			//blob.color = '#000';
			moveBlobs.push(blob);
		}
	});

	if (floorFilled) {
		floorBlobs.forEach(function(blob) {
			blob.color = '#fff';
		});
		timeOutActive = true;
		var timeOutFunction = function() {
			var remaining = [];
			moveBlobs.forEach(function(blob) {
				blob.y += 1;
			});
			blobs.forEach(function(blob) {
				if (floorBlobs.indexOf(blob) == -1) {
					remaining[remaining.length] = blob;
					return;
				}
				blob.filledBlocks = [];
				blob.color = '#ccc';
			});

			blobs = remaining;
			timeOutActive = false;
		};
		setTimeout(timeOutFunction, 1.5*(nextHorizontalMove - Date.now()));
	}
}

var render = function () {
        ctx.fillStyle = "blue";
        ctx.font = "45px Helvetica";
        ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var x = 0; x <= width; x++) {
			ctx.beginPath();
			ctx.moveTo(x*resolution, 0);
			ctx.lineTo(x*resolution, height*resolution);
			ctx.stroke();
		}

		for (var y = 0; y <= height; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y*resolution);
			ctx.lineTo(width*resolution, y*resolution);
			ctx.stroke();
		}
		blobs.forEach(function(e,i) {
			e.render(ctx);
		});
};

// The main game loop
var main = function () {
		if (document.getElementById('pause').checked) {
			ctx.fillStyle = '#000';
			ctx.fillText('Pause', canvas.width / 2 - 60, canvas.height / 2);
			return;
		}
        var now = Date.now();
        var delta = now - then;
		update(delta / 1000);

		render();
        then = now;
};

var then = Date.now();
setInterval(main, 1);