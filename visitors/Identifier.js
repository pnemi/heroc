const
  Printer = require("../asm/Printer").Printer,
  Node = require("./Node").Node,
  FunctionDefinition = require("./FunctionDefinition").FunctionDefinition;

function Identifier() {
  Node.call(this);
  this.name;
  return this;
}

Identifier.prototype = Object.create(Node.prototype);
Identifier.prototype.constructor = Identifier;

Identifier.prototype.print = function () {
  return "IDENTIFIER: " + this.name;
};

Identifier.prototype.getSymbolOffset = function (symbol = this.name, node = this) {
  if (!node) {
    console.error("Symbol \"" + symbol + "\" not found");
  }
  if (node.getClass() === "Node" && node.symbols[symbol]) {
    return symbol + "(%rip)";
  } else if (node.getClass() === "Block" && node.symbols[symbol]) {
    return node.symbols[symbol].offset + "(%rbp)";
  } else {
    return this.getSymbolOffset(symbol, node.parent);
  }
};

Identifier.prototype.isSymbolGlobal = function (symbol = this.name, node = this) {
  if (node.getClass() === "Node" && node.symbols[symbol]) {
    return node.symbols[symbol].type === "ARRAY";
  } else if (node.getClass() === "Block" && node.symbols[symbol]) {
    return false;
  } else {
    return this.isSymbolGlobal(symbol, node.parent);
  }
};

Identifier.prototype.setStackFrameOffset = function (value, node = this.parent) {
  if (node instanceof FunctionDefinition) {
    node.stackFrameOffset = value;
  } else {
    this.setStackFrameOffset(value, node.parent);
  }
};

Identifier.prototype.getStackFrameOffset = function (node = this.parent) {
  if (node instanceof FunctionDefinition) {
    return node.stackFrameOffset;
  } else {
    return this.getStackFrameOffset(node.parent);
  }
};

Identifier.prototype.getAssignmentCode = function (value) {
  let code = Printer.init();
  code.pushOp("movq", "%rax", "%r12");
  dest = this.getSymbolOffset(this.name);
  code.pushOp("movq", "%r12", dest);
  return code.toString();
};

Identifier.prototype.printCode = function () {
  let code = Printer.init();
  code.pushOp("movq", this.getSymbolOffset() , "%rax");
  return code.toString();
};

exports.Identifier = Identifier;
