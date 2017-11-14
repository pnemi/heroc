const
  Printer = require("../asm/Printer").Printer,
  FunctionDefinition = require("./FunctionDefinition").FunctionDefinition,
  Loop = require("./Loop").Loop,
  Node = require("./Node").Node;

function Jump() {
  Node.call(this);
  this.type;
  return this;
}

Jump.prototype = Object.create(Node.prototype);
Jump.prototype.constructor = Jump;

Jump.prototype.print = function () {
  let str = "JUMP (" + this.type + ")";
  str += this.printIndent();
  str += this.printStatements();
  return str;
};

Jump.prototype.getParentLoop = function (node = this.parent) {
  if (node instanceof Loop) {
    return node;
  } else {
    return this.getParentLoop(node.parent);
  }
};

Jump.prototype.getFunctionIndex = function (node = this.parent) {
  if (node.constructor.name === "FunctionDefinition") {
    return node.functionLabelIndex;
  } else {
    return this.getFunctionIndex(node.parent);
  }
};

Jump.prototype.printCode = function () {
  let code = Printer.init();

  if (this.type === "RETURN") {
    this.statements.forEach(stat => {
      code.push(stat.printCode());
    });
    code.pushOp("jmp", "RET" + this.getFunctionIndex());
  } else {
    let parentLoop = this.getParentLoop();
    if (this.type === "BREAK") {
      code.pushOp("jmp", "LE" + parentLoop.loopLabelIndex);
    } else if (this.type === "CONTINUE") {
      if (parentLoop.constructor.name === "ForLoop") {
        code.pushOp("jmp", "LS" + parentLoop.loopLabelIndex);
      } else {
        code.pushOp("jmp", "LB" + parentLoop.loopLabelIndex);
      }
    }
  }

  return code.toString();
};

exports.Jump = Jump;
