const
  Printer = require("../asm/Printer").Printer,
  Variable = require("./Variable").Variable,
  ArrayType = require("./ArrayType").ArrayType,
  Jump = require("./Jump").Jump,
  Node = require("./Node").Node;

function Block() {
  Node.call(this);
  this.symbols = {};
  return this;
}

Block.prototype = Object.create(Node.prototype);
Block.prototype.constructor = Block;

Block.prototype.print = function () {
  let str = "BLOCK";
  str += this.printStatements();
  return str;
};

Block.prototype.pushAllocCode = function (code, block) {
  let allocSpace = block.varCount * 8;
  allocSpace += (allocSpace % 16);

  if (allocSpace) {
    code.pushOp("subq", "$" + allocSpace, "%rsp");
  }

  return allocSpace;
};

Block.prototype.printCode = function (varCount = 0) {
  let code = "";
  let blockCode = "";

  for (let stat of this.statements) {

    // push symbol variable
    if (stat instanceof Variable) {
      let amount;
      if (stat instanceof ArrayType) {
        varCount += (parseInt(stat.size.value) + 1); // plus pointer
      } else {
        varCount++;
      }
      code += stat.printCode(this);
    } else if (stat instanceof Jump && stat.type === "RETURN") {
      code += stat.printCode();
      return {code: code, hasReturn: true, varCount: varCount};
    } else if (stat instanceof Block) {
      blockCode = stat.printCode(varCount);
      varCount = blockCode.varCount;

      code += blockCode.code;
      if (blockCode.hasReturn) {
        return {code: code, hasReturn: true, varCount: varCount};
      }
    } else {
      code += stat.printCode();
    }
  }

  return {code: code, hasReturn: false, varCount: varCount};
};

exports.Block = Block;
