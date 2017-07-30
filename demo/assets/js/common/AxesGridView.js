function AxesGridView(container, axisX, axisY, axisZoom) {
  this.container = container;
  this.axisX = axisX;
  this.axisY = axisY;
  this.axisZoom = axisZoom;
  this.canvas = document.createElement("canvas");
  this.canvas.width = (axisX.range[1] - axisX.range[0]) + axisX.bounce[0] + axisX.bounce[1];
  this.canvas.height = (axisY.range[1] - axisY.range[0]) + axisY.bounce[0] + axisY.bounce[1]; 
  this.ctx = this.canvas.getContext("2d");
  this.container.appendChild(this.canvas);

  this.render(axisX.range[0], axisX.range[0]);
}
AxesGridView.prototype.render = function(x, y, zoom) {

  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this._renderGrid();
  this._renderPoint(x, y, zoom);
};

AxesGridView.prototype._renderGrid = function() {
  var ctx = this.ctx;
  var canvas = this.canvas;
  var range = [
    this.axisX.bounce[0],
    this.axisY.bounce[0], 
    canvas.width - this.axisX.bounce[0], 
    canvas.height - this.axisY.bounce[0]
  ];

  ctx.fillStyle = "#e6e6e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(range[0], range[1], range[2] - this.axisX.bounce[1], range[3] - this.axisY.bounce[1]);

  // grid
  ctx.beginPath();
  ctx.lineWidth = 0.25;

  let i;

  for (i = 0; i < canvas.width; i += 10) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
  }
  for (i = 0; i < canvas.width; i += 10) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
  }

  ctx.strokeStyle = "#0000ff";
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.closePath();

  // bounce area
  ctx.beginPath();
  ctx.lineWidth = 0.5;

  // horizontal
  ctx.moveTo(range[0], range[1]);
  ctx.lineTo(canvas.width - this.axisX.bounce[1], range[1]);
  ctx.moveTo(range[0], canvas.height - this.axisY.bounce[1]);
  ctx.lineTo(canvas.width - this.axisX.bounce[1], canvas.height - this.axisY.bounce[1]);

  // vertical
  ctx.moveTo(range[0], range[1]);
  ctx.lineTo(range[0], canvas.height - this.axisY.bounce[1]);
  ctx.moveTo(canvas.width - this.axisX.bounce[1], range[1]);
  ctx.lineTo(canvas.width - this.axisX.bounce[1], canvas.height - this.axisY.bounce[1]);

  ctx.strokeStyle = "#888";
  ctx.stroke();
  ctx.closePath();

  ctx.font = "bolder 10px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("(panX: " + this.axisX.range[0] + ", panY: " + this.axisY.range[0] + ")", range[0], range[1]);
  ctx.textAlign = "right";
  ctx.textBaseline = "hanging";
  ctx.fillText("(panX: " + this.axisX.range[1] + ", panY: " + this.axisY.range[1] + ")", range[2], range[3]);
};

AxesGridView.prototype._renderPoint = function(x, y, zoom) {
  var ctx = this.ctx;
  ctx.globalAlpha = 0.7;
  ctx.arc(
    this.axisX.bounce[0] + x,
    this.axisY.bounce[0] + y,
    10 * zoom, 0, 2 * Math.PI, false);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.font = "bolder " + (zoom * 10) + "px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("(panX: " + x.toFixed(0) + ", panY: " + y.toFixed(0) + ", zoom: " + zoom + ")", 
    this.axisX.bounce[0] + x,
    this.axisY.bounce[0] + y - 10 * zoom);
};