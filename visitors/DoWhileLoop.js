const
  Printer = require("../asm/Printer").Printer,
  Loop = require("./Loop").Loop;

function DoWhileLoop() {
  Loop.call(this);
  return this;
}

DoWhileLoop.prototype = Object.create(Loop.prototype);
DoWhileLoop.prototype.constructor = DoWhileLoop;

DoWhileLoop.prototype.print = function () {
  let str = "DO WHILE LOOP";
  str += this.printIndent();
  str += this.printStatements();
  return str;
};

DoWhileLoop.prototype.printCode = function () {
  let code = Printer.init();

  code.pushDir("LB" + this.loopLabelIndex + ":");

  let block = this.statements[0]; // always first
  code.push(block.printCode().code);
  code.push("");

  code.push(this.statements[1].printCode());
  code.pushOp("cmpq", "$0", "%rax");
  code.pushOp("jne", "LB" + this.loopLabelIndex);

  return code.toString();
};

exports.DoWhileLoop = DoWhileLoop;
