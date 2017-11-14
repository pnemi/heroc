const
  Operation = require("./Operation").Operation,
  FunctionDefinition = require("./FunctionDefinition").FunctionDefinition,
  Printer = require("../asm/Printer").Printer,
  Loop = require("./Loop").Loop;

function ForLoop() {
  Loop.call(this);
  this.init;
  this.step;
  return this;
}

ForLoop.prototype = Object.create(Loop.prototype);
ForLoop.prototype.constructor = ForLoop;

ForLoop.prototype.print = function () {
  let str = "FOR LOOP\n";
  if (this.init) {
    this.init.level = this.level + 1;
    str += this.printIndent();
    str += "INIT: \n";
    str += this.printIndent();
    str += this.init.print();
    str += "\n";
  }
  if (this.condition) {
    this.condition.level = this.level + 1;
    str += this.printIndent();
    str += "CODITION:\n";
    str += this.printIndent();
    str += this.condition.print();
    str += "\n";
  }
  if (this.step) {
    this.step.level = this.level + 1;
    str += this.printIndent();
    str += "STEP: \n";
    str += this.printIndent();
    str += this.step.print();
  }
  str += this.printIndent();
  str += this.printStatements();
  return str;
};

ForLoop.prototype.printCode = function () {
  let code = new Printer();

  if (this.init) {
    code.push(this.init.printCode());
  }

  code.pushDir("LB" + this.loopLabelIndex + ":"); // LOOP BEGIN

  if (this.condition) {
    code.push(this.condition.printCode());
    code.pushOp("cmpq", "$0", "%rax");
    code.pushOp("je", "LE" + this.loopLabelIndex);
  }

  let block = this.statements[this.statements.length - 1]; // always last
  code.push(block.printCode().code);
  code.push("");

  code.pushDir("LS" + this.loopLabelIndex + ":"); // LOOP STEP

  if (this.step) {
    code.push(this.step.printCode());
  }

  code.pushOp("jmp", "LB" + this.loopLabelIndex);
  code.pushDir("LE" + this.loopLabelIndex + ":"); // LOOP END


  return code.toString();
};

exports.ForLoop = ForLoop;
