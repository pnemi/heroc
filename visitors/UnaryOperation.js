const
  Printer = require("../asm/Printer").Printer,
  OpInst = require("../asm/Printer").OpInst,
  Identifier = require("./Identifier").Identifier,
  Operation = require("./Operation").Operation;

function UnaryOperation() {
  Operation.call(this);
  return this;
}

UnaryOperation.prototype = Object.create(Operation.prototype);
UnaryOperation.prototype.constructor = UnaryOperation;

UnaryOperation.prototype.print = function () {
  let str = "UNARY OPERATION\n";
  str += this.printIndent();
  str += ("Symbol: " + this.operation + "\n");
  str += this.printIndent();
  str += "Operands: ";
  this.level += 1;
  str += this.printStatements();
  return str;
};

UnaryOperation.prototype.getReferenceCode = function (inst) {
  let code = Printer.init();
  let operand = this.statements[0];
  code.pushOp(inst, operand.getSymbolOffset(), "%rax");
  return code.toString();
};

UnaryOperation.prototype.getDereferenceCode = function () {
  let code = Printer.init();
  code.pushOp("movq", "(%rax)", "%rax");
  return code.toString();
};

UnaryOperation.prototype.getNegateCode = function () {
  let code = Printer.init();
  code.pushOp("cmpq", "$0", "%rax");
  code.pushOp("movq", "$0", "%rax");
  code.pushOp("movq", "$1", "%r12");
  code.pushOp("cmove", "%r12", "%rax");
  return code.toString();
};

UnaryOperation.prototype.getMinusCode = function (inst) {
  let code = Printer.init();
  code.pushOp(inst, "%rax");
  return code.toString();
};

UnaryOperation.prototype.getComplementCode = function (inst) {
  let code = Printer.init();
  let operand = this.statements[0];
  if (operand instanceof Identifier) {
    code.pushOp("movq", "(%rax)", "%rax");
  }
  code.pushOp(inst, "%rax");

  return code.toString();
};

UnaryOperation.prototype.getIncDecCode = function (inst) {
  let code = Printer.init();
  let identifier = this.statements[0];
  code.pushOp(inst, "%rax");
  code.pushOp("movq", "%rax", identifier.getSymbolOffset());
  return code.toString();
};

UnaryOperation.prototype.printCode = function () {
  let code = Printer.init();
  let operation = this.operation;
  let inst = OpInst.Unary[operation];
  code.push(this.statements[0].printCode()); // operand

  if (operation === "&") {
    code.push(this.getReferenceCode(inst));
  } else if (operation === "*") {
    code.push(this.getDereferenceCode());
  } else if (operation === "!") {
    code.push(this.getNegateCode());
  } else if (operation === "-") {
    code.push(this.getMinusCode(inst));
  } else if (operation === "~") {
    code.push(this.getComplementCode(inst));
  } else if (operation === "--" ||
             operation === "++") {
    code.push(this.getIncDecCode(inst));
  }

  return code.toString() + "\n";
};

exports.UnaryOperation = UnaryOperation;
