const
  Printer = require("../asm/Printer").Printer,
  Node = require("./Node").Node;

function NumericValue() {
  Node.call(this);
  this.value = 0;
  this.originalValue = 0;
  return this;
}

NumericValue.prototype = Object.create(Node.prototype);
NumericValue.prototype.constructor = NumericValue;

NumericValue.prototype.print = function () {
  return "NUMBER: " + this.originalValue + " (" + this.value + ")";
};

NumericValue.prototype.printCode = function () {
  let code = Printer.init();
  code.pushOp("movq", "$" + this.value, "%rax");
  return code.toString();
};

exports.NumericValue = NumericValue;
