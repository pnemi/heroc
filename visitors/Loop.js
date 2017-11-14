const
  Node = require("./Node").Node;

function Loop() {
  Node.call(this);
  this.loopLabelIndex;
  this.condition;
  return this;
}

Loop.prototype = Object.create(Node.prototype);
Loop.prototype.constructor = Loop;

exports.Loop = Loop;
