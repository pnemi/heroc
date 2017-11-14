const
  Identifier = require("./Identifier").Identifier,
  Variable = require("./Variable").Variable,
  NumericValue = require("./NumericValue").NumericValue,
  Printer = require("../asm/Printer").Printer;

function PrimitiveType() {
  Variable.call(this);
  return this;
}

PrimitiveType.prototype = Object.create(Variable.prototype);
PrimitiveType.prototype.constructor = PrimitiveType;

PrimitiveType.prototype.print = function () {
  let str = "PRIMITIVE VARIABLE\n";
  str += this.printIndent();
  str += ("Identifier: " + this.identifier.name + "\n");
  str += this.printIndent();
  str += ("Assignment: " + this.isAssigned + "\n");
  str += this.printIndent();
  str += ("Global: " + this.isGlobal + "\n");
  str += this.printIndent();
  str += "Value: ";
  this.level += 1;
  str += this.printIndent();
  str += this.printStatements();
  return str;
};

PrimitiveType.prototype.getGloblValues = function (globlSymbols) {
  let code = Printer.init();
  let operand = this.statements[0];
  let name = this.identifier.name;
  let value;
  let type = "PRIMITIVE";
  if (operand instanceof NumericValue) {
    value = operand.value;
  } else if (operand.getClass() === "UnaryOperation") {
    value = operand.statements[0].name;
  }
  code.pushDir(".quad " + value);
  globlSymbols[name] = {};
  return code.toString();
};

PrimitiveType.prototype.getGloblCode = function (globlSymbols) {
  let code = Printer.init();
  let name = this.identifier.name;
  code.pushDir(".globl " + name);
  code.pushDir(".size " + name + ", " + "8");
  code.pushDir(name + ":");
  code.push(this.getGloblValues(globlSymbols));
  return code.toString();
};

PrimitiveType.prototype.printCode = function (parentBlock) {
  let code = Printer.init();

  this.statements.forEach(stat => {
    code.push(stat.printCode());
  });

  let dest;

  if (parentBlock) {
    let offset = this.identifier.getStackFrameOffset() - 8;
    parentBlock.symbols[this.identifier.name] = {
      offset: offset,
      type: "PRIMITIVE"
    };
    this.identifier.setStackFrameOffset(offset);
  }

  if (this.isAssigned) {
    code.push(this.identifier.getAssignmentCode());
  } else {
    code.pushOp("movq", "%rax", this.identifier.getSymbolOffset());
  }

  return code.toString() + "\n";
};

exports.PrimitiveType = PrimitiveType;
