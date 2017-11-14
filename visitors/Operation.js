const
  Node = require("./Node").Node,
  BinaryOperation = require("./BinaryOperation").BinaryOperation;

function Operation() {
  Node.call(this);
  this.operation;
  this.name;
  return this;
}

Operation.prototype = Object.create(Node.prototype);
Operation.prototype.constructor = Operation;


exports.Operation = Operation;
