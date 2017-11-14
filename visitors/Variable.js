const
  Node = require("./Node").Node;

function Variable() {
  Node.call(this);
  this.identifier;
  this.isAssigned = false;
  return this;
}

Variable.prototype = Object.create(Node.prototype);
Variable.prototype.constructor = Variable;

exports.Variable = Variable;
