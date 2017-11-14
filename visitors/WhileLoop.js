const
  Printer = require("../asm/Printer").Printer,
  Loop = require("./Loop").Loop;

function WhileLoop() {
  Loop.call(this);
  return this;
}

WhileLoop.prototype = Object.create(Loop.prototype);
WhileLoop.prototype.constructor = WhileLoop;

WhileLoop.prototype.print = function () {
  let str = "WHILE LOOP";
  str += this.printIndent();
  str += this.printStatements();
  return str;
};

WhileLoop.prototype.printCode = function () {
  let code = Printer.init();

  code.pushDir("LB" + this.loopLabelIndex + ":");

  // condition
  if (this.statements.length > 1) {
    code.push(this.statements[0].printCode());
    code.pushOp("cmpq", "$0", "%rax");
    code.pushOp("je", "LE" + this.loopLabelIndex);
  }

  let block = this.statements[this.statements.length - 1]; // always last
  code.push(block.printCode().code);
  code.push("");

  code.pushOp("jmp", "LB" + this.loopLabelIndex);
  code.pushDir("LE" + this.loopLabelIndex + ":");

  return code.toString();

};

exports.WhileLoop = WhileLoop;
