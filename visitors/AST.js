const
  Printer = require("../asm/Printer").Printer,
  Node = require("./Node").Node;

function AST() {
  this.root = new Node();
  this.filename = null;
  return this;
}

AST.prototype.printTree = function () {
  return this.root.printStatements();
};

AST.prototype.printCode = function () {
  let code = Printer.init();
  code.pushDir(".file \"" + this.filename + "\"");
  code.push(this.root.printCode());
  code.pushDir(".ident \"HEROC\"");
  code.push(""); // EOF
  return code.toString();
};

exports.AST = AST;
