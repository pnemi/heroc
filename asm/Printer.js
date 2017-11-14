function Printer() {
  this.buffer = [];
  return this;
}

const Registers = {};

Registers.Args = [
  "rdi",
  "rsi",
  "rdx",
  "rcx",
  "r8",
  "r9"
];

Registers.ArgsReversed = Registers.Args.slice(0).reverse();

const OpInst = {
  Binary: {
    "=":  "movq",
    "==": "cmove",
    "+=":  "addq",
    "-=":  "subq",
    "^=":  "xorq",
    "<<": "salq",
    "<<=": "salq",
    ">>=": "sarq",
    ">>": "sarq",
    "|":  "orq",
    "||": "orq",
    "+":  "addq",
    "-":  "subq",
    "<":  "cmovlq",
    ">":  "cmovg",
    ">=": "cmovge",
    "<=":  "cmovleq",
    "!=":  "cmovne",
    ">":  "cmovg",
    "&":  "andq",
    "&&": "andq",
    "^":  "xorq",
    "*":  "imulq",
    "*=": "imulq",
    "/":  "idivq",
    "/=":  "idivq",
    "%":  "idivq",
    "%=":  "idivq"
  },
  Unary: {
    "-":  "negq",
    "&":  "leaq",
    "~":  "notq",
    "++": "incq",
    "--": "decq"
  },
  Postfix: {
    "++": "incq",
    "--": "decq"
  }
};

// Static Methods
// ==============

Printer.init = function() {
  return (new Printer());
};

Printer.getInstFromOp = function(operation) {
  return InstructionMap[operation];
};

// Prototype Methods
// ==============

Printer.prototype.push = function(code) {
  this.buffer.push(code);
};

Printer.prototype.pushDir = function(code) {
  this.buffer.push(code);
};

Printer.prototype.pushOp = function(inst, src = "", dest) {
  let code = "\t" + inst + "\t\t" + src;
  if (dest) {
    code += ", " + dest;
  }
  this.buffer.push(code);
};

Printer.prototype.toString = function() {
  return this.buffer.join("\n");
};

exports.Printer = Printer;
exports.OpInst = OpInst;
exports.Registers = Registers;
