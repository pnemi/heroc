const
  Printer = require("../asm/Printer").Printer;

function Node(parent, statements) {
  this.parent = parent || null;
  this.statements = statements || [];
  this.level = 0;
  this.symbols = {}; // globals
  this.constants = [];
  return this;
}

Node.prototype.getClass = function () {
  return this.constructor.name;
};

Node.prototype.printStatements = function () {
  let statStr = "";

  this.statements.forEach(statement => {
    statement.level = this.level + 1;
    statStr += "\n";
    statStr += this.printIndent();
    statStr += statement.print();
  });

  return statStr;
};

Node.prototype.printIndent = function () {
  return " ".repeat(this.level * 4);
};

Node.prototype.pushStatement = function (statement) {
  statement.parent = this;
  this.statements.push(statement);
};

Node.prototype.pushStatements = function (statements) {
  statements.forEach(statement => this.pushStatement(statement));
};

Node.prototype.printCode = function () {
  let code = Printer.init();

  let funcCode = Printer.init();
  let varCode = Printer.init();

  varCode.pushDir(".data");
  funcCode.pushDir(".text");

  this.statements.forEach(stat => {
    let name = stat.identifier.name;
    if (stat.getClass() === "PrimitiveType" ||
        stat.getClass() === "ArrayType") {
      varCode.push(stat.getGloblCode(this.symbols));
    } else {
      this.symbols[name] = {};
      funcCode.push(stat.printCode());
    }
  });

  this.constants.forEach(cons => {
    let label = "LC" + cons.index;
    let size = (cons.values.length + 1) * 8; // plus EOS
    varCode.pushDir(".size " + label + ", " + size);
    varCode.pushDir(label + ":");

    cons.values.forEach(val => {
      varCode.pushDir(".quad " + val);
    });

    this.symbols[cons.string] = {
      offset: -1,
      type: "ARRAY",
      isGlobal: true
    };
  });

  code.push(varCode.toString());
  code.push(funcCode.toString());


  return code.toString();
};

exports.Node = Node;
