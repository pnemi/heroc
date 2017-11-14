const
  Printer = require("../asm/Printer").Printer,
  Node = require("./Node").Node;

function Selection() {
  Node.call(this);
  this.type;
  this.condition;
  this.ifBlock;
  this.elseBlock;
  this.selectionLabelIndex;
  return this;
}

Selection.prototype = Object.create(Node.prototype);
Selection.prototype.constructor = Selection;

Selection.prototype.print = function () {
  let str = "SELECTION\n";
  this.condition.level = this.level + 1;
  str += this.printIndent();
  str += "CONDITION:\n";
  str += this.printIndent();
  str += this.condition.print();

  this.ifBlock.level = this.level + 1;
  str += "\n";
  str += this.printIndent();
  str += "IF BLOCK:\n";
  str += this.printIndent();
  str += this.ifBlock.print();
  str += this.printIndent();

  if (this.elseBlock) {
    this.elseBlock.level = this.level + 1;
    str += "\n";
    str += this.printIndent();
    str += "ELSE BLOCK:\n";
    str += this.printIndent();
    str += this.elseBlock.print();
    str += this.printIndent();
  }

  return str;
};

Selection.prototype.printCode = function () {
  let code = Printer.init();

  code.push(this.condition.printCode());
  code.pushOp("cmpq", "$0", "%rax");
  code.pushOp("je", "SB" + this.selectionLabelIndex);

  let ifBlockCode = this.ifBlock.printCode();

  if (this.type === "IF") {
    this.ifBlock.pushAllocCode(code, ifBlockCode);
    code.push(ifBlockCode.code);
  } else {
    code.push(ifBlockCode);
  }

  code.pushOp("jmp", "SE" + this.selectionLabelIndex);

  code.pushDir("SB" + this.selectionLabelIndex + ":");

  if (this.elseBlock) {
    let elseBlockCode = this.elseBlock.printCode();
    if (this.type === "IF") {
      this.elseBlock.pushAllocCode(code, ifBlockCode);
      code.push(elseBlockCode.code);
    } else {
      code.push(elseBlockCode);
    }
  }

  code.pushDir("SE" + this.selectionLabelIndex + ":");

  return code.toString();
};

exports.Selection = Selection;
