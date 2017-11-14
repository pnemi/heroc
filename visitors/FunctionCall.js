const
  Printer = require("../asm/Printer").Printer,
  Registers = require("../asm/Printer").Registers,
  Identifier = require("./Identifier").Identifier,
  PostfixOperation = require("./PostfixOperation").PostfixOperation,
  Operation = require("./Operation").Operation;

function FunctionCall() {
  PostfixOperation.call(this);
  this.identifier;
  this.registerIndex;
  return this;
}

FunctionCall.prototype = Object.create(PostfixOperation.prototype);
FunctionCall.prototype.constructor = FunctionCall;

FunctionCall.prototype.print = function () {
  let str = (this.name.toUpperCase()) + " POSTFIX OPERATION\n";
  str += this.printIndent();
  if (this.identifier) {
    str += this.identifier.print();
    str += this.printIndent();
  }
  str += ("Symbol: " + this.operation + "\n");
  str += this.printIndent();
  str += "Operands: ";
  this.level += 1;
  str += this.printStatements();
  return str;
};

FunctionCall.prototype.getPushRegistersCode = function () {
  let code = Printer.init();
  code.push("");
  Registers.Args.forEach(reg => {
    code.pushOp("pushq", "%" + reg);
  });
  return code.toString();
};

FunctionCall.prototype.getRootNode = function (node = this.parent) {
  if (node.getClass() === "Node") {
    return node;
  } else {
    return this.getRootNode(node.parent);
  }
};

FunctionCall.prototype.getPopRegistersCode = function () {
  let code = Printer.init();
  Registers.ArgsReversed.forEach(reg => {
    code.pushOp("popq", "%" + reg);
  });
  code.push("");
  return code.toString();
};

FunctionCall.prototype.getArgsCode = function () {
  let code = Printer.init();
  let registerIndex = 0;

  this.statements.forEach(stat => {
    code.push(stat.printCode());
    code.pushOp("movq", "%rax", "%" + Registers.Args[registerIndex++]);
  });
  return code.toString();
};

FunctionCall.prototype.printCode = function () {
  let code = Printer.init();

  let root = this.getRootNode();

  code.push(this.getPushRegistersCode());
  code.push(this.getArgsCode());
  if (this.identifier instanceof Identifier) {
    code.pushOp("call", this.identifier.name);
  } else {
    code.push(this.identifier.printCode());
    code.pushOp("call", "*" + "%rax")
  }
  code.push(this.getPopRegistersCode());
  return code.toString();
};

exports.FunctionCall = FunctionCall;
