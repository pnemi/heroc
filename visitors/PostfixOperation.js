const
  Printer = require("../asm/Printer").Printer,
  OpInst = require("../asm/Printer").OpInst,
  BinaryOperation = require("./BinaryOperation").BinaryOperation,
  Identifier = require("./Identifier").Identifier,
  StringValue = require("./StringValue").StringValue,
  ArrayType = require("./ArrayType").ArrayType,
  Operation = require("./Operation").Operation;

function PostfixOperation() {
  Operation.call(this);
  return this;
}

PostfixOperation.prototype = Object.create(Operation.prototype);
PostfixOperation.prototype.constructor = PostfixOperation;

PostfixOperation.prototype.print = function () {
  let str = (this.name.toUpperCase()) + " POSTFIX OPERATION\n";
  str += this.printIndent();
  str += ("Symbol: " + this.operation + "\n");
  str += this.printIndent();
  str += "Operands: ";
  this.level += 1;
  str += this.printStatements();
  return str;
};

PostfixOperation.prototype.getIncDecCode = function (inst) {
  let code = Printer.init();
  let identifier = this.statements[0];
  code.pushOp(inst, identifier.getSymbolOffset());
  return code.toString();
};

PostfixOperation.prototype.getArrayCode = function (isAssignment) {
  let code = Printer.init();
  let identifier = this.statements[0];
  let operand = this.statements[1];

  if (identifier instanceof StringValue ||
      (identifier instanceof ArrayType && identifier.isConstant)) {
    code.push(operand.printCode());
    code.pushOp("leaq", "0(,%rax,8)", "%rdx");
    code.pushOp("leaq", "LC" + identifier.constantLabelIndex + "(%rip)", "%rax");
    code.pushOp("movq", "(%rdx,%rax)", "%rax");
  } else {
    if (identifier instanceof Identifier && identifier.isSymbolGlobal()) {
      code.push(operand.printCode());
      code.pushOp("leaq", "0(,%rax,8)", "%rdx");
      code.pushOp("leaq", identifier.name + "(%rip)", "%rax");
      if (isAssignment) {
        code.pushOp("movq", "%r12", "(%rdx,%rax)");
      } else {
        code.pushOp("movq", "(%rdx,%rax)", "%rax");
      }
    } else {
      code.pushOp("pushq", "%rax");
      code.push(operand.printCode());
      code.pushOp("popq", "%r10");
      code.pushOp("imulq", "$8", "%rax");
      code.pushOp("addq", "%rax", "%r10");
      if (isAssignment) {
        code.pushOp("movq", "%r10", "%rax");
      } else {
        code.pushOp("movq", "(%r10)", "%rax");
      }
    }
  }

  return code.toString();
};

PostfixOperation.prototype.printCode = function () {
  let code = Printer.init();
  let operation = this.operation;
  let inst = OpInst.Postfix[operation];
  code.push(this.statements[0].printCode()); // operand

  if (operation === "++" ||
      operation === "--") {
    code.push(this.getIncDecCode(inst));
  } else if (operation === "[]") {
    code.push(this.getArrayCode(false));
  }
  return code.toString() + "\n";
};

exports.PostfixOperation = PostfixOperation;
