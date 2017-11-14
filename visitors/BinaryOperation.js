const
  Printer = require("../asm/Printer").Printer,
  OpInst = require("../asm/Printer").OpInst,
  Identifier = require("./Identifier").Identifier,
  NumericValue = require("./NumericValue").NumericValue,
  ArrayType = require("./ArrayType").ArrayType,
  UnaryOperation = require("./UnaryOperation").UnaryOperation,
  PostfixOperation = require("./PostfixOperation").PostfixOperation,
  Operation = require("./Operation").Operation;

function BinaryOperation() {
  Operation.call(this);
  return this;
}

BinaryOperation.prototype = Object.create(Operation.prototype);
BinaryOperation.prototype.constructor = BinaryOperation;

BinaryOperation.prototype.print = function () {
  let str = (this.name.toUpperCase()) + " BINARY OPERATION\n";
  str += this.printIndent();
  str += ("Symbol: " + this.operation + "\n");
  str += this.printIndent();
  str += "Operands: ";
  this.level += 1;
  str += this.printStatements();
  return str;
};

BinaryOperation.prototype.getAssignmentCode = function (inst) {
  let code = Printer.init();
  let dest = this.statements[0];
  let source = this.statements[1];

  if (dest instanceof Identifier) {
    code.push(dest.getAssignmentCode());
  } else if (dest instanceof UnaryOperation) {
    let destOperand = dest.statements[0];
    code.pushOp("movq", "%rax", "%r12");
    code.push(destOperand.printCode());
    code.pushOp("movq", "%r12", "(%rax)");
  } else if (dest instanceof PostfixOperation) {
    let destOperand = dest.statements[0];
    code.pushOp("movq", "%rax", "%r12");
    code.push(destOperand.printCode());
    code.push(dest.getArrayCode(true));
    code.pushOp("movq", "%r12", "(%rax)");
  }

  return code.toString() + "\n";
};

BinaryOperation.prototype.getShiftCode = function (inst) {
  let code = Printer.init();

  code.pushOp("popq", "%r10");
  code.pushOp("popq", "%r11");
  code.pushOp("pushq", "%rdx");
  code.pushOp("pushq", "%rcx");
  code.pushOp("movq", "%r11", "%rcx");
  code.pushOp("movq", "%r10", "%rdx");
  code.pushOp(inst, "%cl", "%rdx"); // only works with CL
  code.pushOp("movq", "%rdx", "%rax");
  code.push("cltq");
  code.pushOp("popq", "%rcx");
  code.pushOp("popq", "%rdx");
  code.pushOp("pushq", "%rax");

  return code.toString();
};

BinaryOperation.prototype.getModuloCode = function (inst) {
  let code = Printer.init();

  code.pushOp("popq", "%rax");
  code.pushOp("popq", "%r10");
  code.pushOp("pushq", "%rdx");
  code.pushOp("cdq");
  code.pushOp(inst, "%r10");
  code.pushOp("popq", "%rax");
  code.pushOp("pushq", "%rdx");
  code.pushOp("movq", "%rax", "%rdx");

  return code.toString();
};

BinaryOperation.prototype.getGenericCode = function (inst) {
  let code = Printer.init();

  code.pushOp("popq", "%r11");
  code.pushOp("popq", "%r10");
  code.pushOp(inst, "%r10", "%r11");
  code.pushOp("pushq", "%r11");

  return code.toString();
};

BinaryOperation.prototype.getRelationalCode = function (inst) {
  var code = Printer.init();

  code.pushOp("popq", "%r11");
  code.pushOp("popq", "%r10");
  code.pushOp("cmpq", "%r10", "%r11");
  code.pushOp("movq", "$0", "%rax");
  code.pushOp("movq", "$1", "%r12");
  code.pushOp(inst, "%r12", "%rax");
  code.pushOp("pushq", "%rax");

  return code.toString();
};

BinaryOperation.prototype.getLogicalCode = function (inst) {
  var code = Printer.init();

  code.pushOp("popq", "%r10");
  code.pushOp("popq", "%r11");
  code.pushOp("cmpq", "$0", "%r10");
  code.pushOp("movq", "$1", "%r10");
  code.pushOp("movq", "$0", "%r12");
  code.pushOp("cmove", "%r12", "%r10");
  code.pushOp("cmpq", "$0", "%r11");
  code.pushOp("movq", "$1", "%r11");
  code.pushOp("movq", "$0", "%r12");
  code.pushOp("cmove", "%r12", "%r11");
  code.pushOp(inst, "%r10", "%r11");
  code.pushOp("pushq", "%r11");

  return code.toString();
};

BinaryOperation.prototype.getDivisionCode = function (inst) {
  var code = Printer.init();

  code.pushOp("popq", "%rax");
  code.pushOp("popq", "%r10");
  code.pushOp("pushq", "%rdx");
  code.pushOp("cdq");
  code.pushOp(inst, "%r10");
  code.pushOp("popq", "%rdx");
  code.pushOp("pushq", "%rax");

  return code.toString();
};

BinaryOperation.prototype.getOperationCode = function () {

  let operation = this.operation;
  let name = this.name.toUpperCase();
  let inst = OpInst.Binary[operation];

  if (operation === "<<" ||
      operation === ">>" ||
      operation === "<<=" ||
      operation === ">>=") {
    return this.getShiftCode(inst);
  } else if (operation === "-" ||
             operation === "+") {
    return this.getGenericCode(inst);
  } else if (operation === "%") {
    return this.getModuloCode(inst);
  } else if (operation === "/" ||
             operation === "/=") {
    return this.getDivisionCode(inst);
  } else if (name.split(" ")[0] === "LOGICAL") {
    return this.getLogicalCode(inst);
  } else if (name === "RELATIONAL" ||
             name === "EQUALITY") {
    return this.getRelationalCode(inst);
  }

  return this.getGenericCode(inst);
};

BinaryOperation.prototype.makeOperationStack = function (node = this) {
  let stack = [];

  if (!(node instanceof NumericValue &&
        node.parent instanceof ArrayType &&
        node.parent.isConstant)) {
  stack.push(node);
}

  if (!(node instanceof UnaryOperation ||
        node instanceof PostfixOperation)) {
    node.statements.forEach(stat => {
      this.makeOperationStack(stat).forEach(val => {
        stack.push(val);
      });
    });
  }


  return stack;
};

BinaryOperation.prototype.printCode = function () {
  let code = Printer.init();

  if (this.operation === "=") {
    let source = this.statements[1];
    code.push(source.printCode());
    code.push(this.getAssignmentCode());
  } else {
    let stack = this.makeOperationStack();

    while (stack.length > 0) {
      let op = stack.pop();

      if (op instanceof BinaryOperation) {
        code.push(op.getOperationCode());
      } else {
        if (!((op instanceof Identifier ||
              op instanceof NumericValue) &&
              op.parent instanceof PostfixOperation)) {
          code.push(op.printCode());
          code.pushOp("pushq", "%rax");
        }
      }
    }
    code.pushOp("popq", "%rax");

    let name = this.name.toUpperCase();
    if (name === "ASSIGNMENT" && this.operation !== "=") {
      code.push(this.getAssignmentCode());
    }
    code.push("");
  }

  return code.toString();
};

exports.BinaryOperation = BinaryOperation;
