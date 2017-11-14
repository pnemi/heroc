const
  Printer = require("../asm/Printer").Printer,
  Node = require("./Node").Node;

function StringValue() {
  Node.call(this);
  this.value;
  this.constantLabelIndex;
  this.isChar = false;
  return this;
}

StringValue.prototype = Object.create(Node.prototype);
StringValue.prototype.constructor = StringValue;

StringValue.prototype.print = function () {
  return (this.isChar ? "CHAR: " : "STRING: ") + this.value;
};

StringValue.prototype.pushStringConstant = function (node = this, values = this.value, index = this.constantLabelIndex) {
  if (node.getClass() === "Node") {
    node.constants.push({
      values: values.split("").map(l => {
        return l.charCodeAt(0)
      }),
      index: index});
  } else {
    this.pushStringConstant(node.parent, values, index);
  }
};

StringValue.prototype.printCode = function () {
  let code = Printer.init();
  if (this.isChar) {
    code.pushOp("movq", "$" + this.value.charCodeAt(0), "%rax");
  } else {
    this.pushStringConstant();
    code.pushOp("leaq", "LC" + this.constantLabelIndex + "(%rip)", "%rax");
  }
  return code.toString();
};

exports.StringValue = StringValue;
