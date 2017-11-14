const
  Printer = require("../asm/Printer").Printer,
  Registers = require("../asm/Printer").Registers,
  Node = require("./Node").Node,
  Jump = require("./Jump").Jump;

function FunctionDefinition() {
  Node.call(this);
  this.identifier;
  this.functionLabelIndex;
  this.stackFrameOffset = 0;
  this.args = [];
  return this;
}

FunctionDefinition.prototype = Object.create(Node.prototype);
FunctionDefinition.prototype.constructor = FunctionDefinition;

FunctionDefinition.prototype.print = function () {

  let str = "FUNCTION DEFINITION\n";
  str += this.printIndent();
  str += ("Identifier: " + this.identifier.name + "\n");
  str += this.printIndent();
  str += "Arguments: ";
  this.level += 1;
  str += this.printArguments();
  this.level -= 1;
  str += ("\n" + this.printIndent());
  str += "Body:";
  this.level += 1;
  str += this.printStatements();
  return str;
};

FunctionDefinition.prototype.printArguments = function () {
  let argStr = "";

  this.args.forEach(arg => {
    arg.level = this.level + 1;
    argStr += "\n";
    argStr += this.printIndent();
    argStr += arg.print();
  });

  return argStr;
};

FunctionDefinition.prototype.pushArgument = function (arg) {
  arg.parent = this;
  this.args.push(arg);
};

FunctionDefinition.prototype.pushArguments = function (args) {
  args.forEach(arg => this.pushArgument(arg));
};

FunctionDefinition.prototype.getArgsCode = function () {
  let code = Printer.init();
  let reg;
  let block = this.statements[0];
  this.args.forEach((arg, i) => {
    let symbol = arg.name;
    reg = Registers.Args[i];
    let offset = this.stackFrameOffset - 8;
    code.pushOp("movq", "%" + reg, offset + "(%rbp)");
    block.symbols[symbol] = {
      offset: offset
    };
    this.stackFrameOffset -= 8;
  });

  return {code: code.toString(), varCount: this.args.length};
};

FunctionDefinition.prototype.printCode = function () {
  let name = this.identifier.name;
  let code = Printer.init();
  code.pushDir(".globl " + name);
  code.pushDir(".type " + name + ", @function");
  code.pushDir(name + ":");
  code.pushDir(".LFB" + this.functionLabelIndex + ":");

  // create stack frame
  code.pushOp("pushq", "%rbp");
  code.pushOp("movq", "%rsp", "%rbp");

  let argsCode = this.getArgsCode();

  let block = this.statements[0];
  let blockCode = block.printCode();

  blockCode.varCount += argsCode.varCount; // add args alloc

  let allocated = block.pushAllocCode(code, blockCode);

  code.push(argsCode.code);

  code.push(blockCode.code);

  if (!blockCode.hasReturn) {
    code.pushOp("movq", "$0", "%rax");
  }

  code.pushOp("addq", "$" + allocated, "%rsp");

  code.pushDir("RET" + this.functionLabelIndex + ":");

  // destroy stack frame
  code.pushOp("leave");
  code.pushOp("ret");

  code.pushDir(".LFE" + this.functionLabelIndex + ":");
  code.pushDir(".size " + name + ", .-" + name);

  return code.toString();
};

exports.FunctionDefinition = FunctionDefinition;
