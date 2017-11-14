const
  Printer = require("../asm/Printer").Printer,
  Variable = require("./Variable").Variable,
  NumericValue = require("./NumericValue").NumericValue;

function ArrayType() {
  Variable.call(this);
  this.size = new NumericValue();
  this.isConstant = false;
  this.constantLabelIndex;
  return this;
}

ArrayType.prototype = Object.create(Variable.prototype);
ArrayType.prototype.constructor = ArrayType;

ArrayType.prototype.print = function () {
  let str = "ARRAY\n";
  str += this.printIndent();
  if (this.identifier) {
    str += ("Identifier: " + this.identifier.name + "\n");
    str += this.printIndent();
  }
  str += ("Assignment: " + this.isAssigned + "\n");
  str += this.printIndent();
  str += ("Global: " + this.isGlobal + "\n");
  str += this.printIndent();
  str += ("Size: \n");
  this.level += 1;
  str += this.printIndent();
  str += this.size.print();
  this.level -= 1;
  str += ("\n" + this.printIndent());
  str += "Values: ";
  this.level += 1;
  str += this.printIndent();
  str += this.printStatements();

  return str;
};

ArrayType.prototype.pushArrayConstant = function (node = this, values = this.statements, index = this.constantLabelIndex) {
  if (node.getClass() === "Node") {
    node.constants.push({
      values: values.map(stat => {
        return stat.value
      }),
      index: index});
  } else {
    this.pushArrayConstant(node.parent, values, index);
  }
};

ArrayType.prototype.printCode = function (parentBlock) {
  let code = Printer.init();

  if (this.isConstant) {
    this.pushArrayConstant();
    code.pushOp("leaq", "LC" + this.constantLabelIndex + "(%rip)", "%rax");
  } else {
    let offset = this.identifier.getStackFrameOffset() - 8;
    let offsetBackup = offset;

    for (var i = this.size.value - 1; i >= 0; i--) {
      offset -= 8;
      if (this.isAssigned) {
        code.push(this.statements[i].printCode());
      } else {
        code.pushOp("movq", "$0", "%rax");
      }
      code.pushOp("movq", "%rax", offset + "(%rbp)");
    }

    code.pushOp("leaq", (offset) + "(%rbp)", "%rax");
    code.pushOp("movq", "%rax", (offsetBackup) + "(%rbp)");

    if (parentBlock) {
      parentBlock.symbols[this.identifier.name] = {
        offset: offsetBackup
      };
      this.identifier.setStackFrameOffset(offset);
    }
  }

  return code.toString() + "\n";
};

ArrayType.prototype.getGloblValues = function () {
  let code = Printer.init();
  this.statements.forEach(stat => {
    code.pushDir(".quad " + stat.value);
  })
  return code.toString();
};

ArrayType.prototype.getGloblCode = function (globlSymbols) {
  let code = Printer.init();
  let name = this.identifier.name;
  let size = (this.size.value * 8);
  if (this.isAssigned) {
    code.pushDir(".globl " + name);
    code.pushDir(".size " + name + ", " + size);
    code.pushDir(name + ":");
    code.push(this.getGloblValues());
  } else {
    code.pushDir(".comm " + name + "," + size + ",32")
  }
  globlSymbols[name] = {
    offset: -1,
    type: "ARRAY"
  };
  return code.toString();
};

exports.ArrayType = ArrayType;
