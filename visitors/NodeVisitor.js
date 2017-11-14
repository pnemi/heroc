const
  gramarPath = ".././grammar/target/generated-sources/antlr4/",
  HEROCVisitor = require(gramarPath + "HEROCVisitor").HEROCVisitor,
  HEROCParser = require(gramarPath + "HEROCParser").HEROCParser,
  HEROCLexer = require(gramarPath + "HEROCLexer").HEROCLexer,
  AST = require("./AST").AST,
  Identifier = require("./Identifier").Identifier,
  PrimitiveType = require("./PrimitiveType").PrimitiveType,
  ArrayType = require("./ArrayType").ArrayType,
  StringValue = require("./StringValue").StringValue,
  NumericValue = require("./NumericValue").NumericValue,
  BinaryOperation = require("./BinaryOperation").BinaryOperation,
  UnaryOperation = require("./UnaryOperation").UnaryOperation,
  PostfixOperation = require("./PostfixOperation").PostfixOperation,
  FunctionDefinition = require("./FunctionDefinition").FunctionDefinition,
  FunctionCall = require("./FunctionCall").FunctionCall,
  Block = require("./Block").Block,
  ForLoop = require("./ForLoop").ForLoop,
  WhileLoop = require("./WhileLoop").WhileLoop,
  DoWhileLoop = require("./DoWhileLoop").DoWhileLoop,
  Selection = require("./Selection").Selection,
  Jump = require("./Jump").Jump;

function NodeVisitor(parent, children) {
  HEROCVisitor.call(this);
  this.parent = parent || null;
  this.children = children || [];
  this.functionLabelIndex = 0;
  this.loopLabelIndex = 0;
  this.constantLabelIndex = 0;
  this.selectionLabelIndex = 0;
  return this;
}

NodeVisitor.prototype = Object.create(HEROCVisitor.prototype);
NodeVisitor.prototype.constructor = NodeVisitor;

NodeVisitor.prototype.visitProgram = function(ctx) {

  let tree = new AST();
  let externalDeclarationCtxChild = ctx.children[0];
  let results = this.visit(externalDeclarationCtxChild) || [];

  results.forEach(result => {
    if (Array.isArray(result)) {
      tree.root.pushStatements(result);
    } else {
      tree.root.pushStatement(result);
    }
  });

  return tree;
};

NodeVisitor.prototype.visitExternalDeclaration = function(ctx) {

  let results = [];
  let externalDeclarationsCtxChildren = ctx.children;

  externalDeclarationsCtxChildren.forEach(child => {
    if (child.constructor.name === "ExternalDeclarationContext") {
      let declarations = this.visit(child);
      declarations.forEach(declaration => {
        results.push(declaration);
      });
    } else {
      results.push(this.visit(child));
    }
  });

  return results;
};

NodeVisitor.prototype.visitDeclaration = function(ctx) {
  let declaration = this.visit(ctx.children[1]);
  if (ctx.parentCtx.constructor.name === "ExternalDeclarationContext") {
    declaration[0].isGlobal = true;
  }
  return declaration;
};

NodeVisitor.prototype.visitInitDeclaratorList = function(ctx) {

  let variables = [];

  ctx.children.forEach(child => {
    // skip unwanted commas separating declarators
    if (child instanceof HEROCParser.InitDeclaratorContext) {
      variables.push(this.visit(child));
    }
  });

  return variables;
};

NodeVisitor.prototype.visitInitDeclarator = function(ctx) {

  let variable;
  let declaratorCtxChildren = ctx.children;

  if (declaratorCtxChildren instanceof HEROCParser.PointerContext) {
    variable = this.visit(declaratorCtxChildren[1]);
  } else {
    variable = this.visit(declaratorCtxChildren[0]);
  }

  return variable;
};

NodeVisitor.prototype.visitInitDeclaratorPrimitive = function(ctx) {

  let identifier = new Identifier();
  identifier.name = ctx.children[0].toString();

  let variable = new PrimitiveType();
  variable.identifier = identifier;

  identifier.parent = variable;

  let value;

  if (ctx.children.length > 1) {
    variable.isAssigned = true;
    value = this.visit(ctx.children[2]);
  } else {
    variable.isAssigned = false;
    value = new NumericValue();
  }

  variable.pushStatement(value);

  return variable;
};

NodeVisitor.prototype.visitExpression = function(ctx) {
  if (ctx.children.length === 1) {
    return this.visit(ctx.children[0]);
  } else {
    return this.visitBinaryExpression(ctx, "Assignment");
  }
};

NodeVisitor.prototype.visitExpressionStatement = function(ctx) {
  return this.visit(ctx.children[0]);
};

NodeVisitor.prototype.visitBinaryExpression = function(ctx, name) {
  if (ctx.children.length === 1) {
    return this.visit(ctx.children[0]);
  } else {
    let operationType = ctx.children[1].getText();
    let operation = new BinaryOperation();
    operation.operation = operationType;
    operation.name = name;
    let leftOperand = this.visit(ctx.children[0]);
    let rightOperand = this.visit(ctx.children[2]);
    operation.pushStatements([leftOperand, rightOperand]);
    return operation;
  }
};

NodeVisitor.prototype.visitConditionalExpression = function(ctx) {
  if (ctx.children.length > 1) {
    let selection = new Selection();
    selection.type = "TERNARY";

    selection.selectionLabelIndex = this.selectionLabelIndex++;

    selection.condition = this.visit(ctx.children[0]);
    selection.condition.parent = selection;

    selection.ifBlock = this.visit(ctx.children[2]);
    selection.ifBlock.parent = selection;

    selection.elseBlock = this.visit(ctx.children[4]);
    selection.elseBlock.parent = selection;

    return selection;
  } else {
    return this.visit(ctx.children[0]);
  }
};

NodeVisitor.prototype.visitLogicalOrExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Logical Or");
};

NodeVisitor.prototype.visitLogicalAndExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Logical And");
};

NodeVisitor.prototype.visitInclusiveOrExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Inclusive Or");
};

NodeVisitor.prototype.visitExclusiveOrExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Exclusive Or");
};

NodeVisitor.prototype.visitAndExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "And");
};

NodeVisitor.prototype.visitEqualityExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Equality");
};

NodeVisitor.prototype.visitRelationalExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Relational");
};

NodeVisitor.prototype.visitShiftExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Shift");
};

NodeVisitor.prototype.visitAdditiveExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Additive");
};

NodeVisitor.prototype.visitMultiplicativeExpression = function(ctx) {
  return this.visitBinaryExpression(ctx, "Multiplicative");
};

NodeVisitor.prototype.visitUnaryExpression = function(ctx) {
  if (ctx.children.length === 1) {
    return this.visit(ctx.children[0]);
  } else if (ctx.children[0].toString() === "sizeof") {
    let sizeof = new NumericValue();
    sizeof.value = sizeof.originalValue = 8;
    return sizeof;
  } else {
    let operationType = this.visit(ctx.children[0]);
    let operation = new UnaryOperation();
    operation.operation = operationType;
    operation.pushStatement(this.visit(ctx.children[1]));
    return operation;
  }
};

NodeVisitor.prototype.visitUnaryOperator = function(ctx) {
  return ctx.children[0].toString();
};

NodeVisitor.prototype.visitAssignmentOperator = function(ctx) {
  return ctx.children[0].toString();
};

NodeVisitor.prototype.visitPrimaryExpression = function(ctx) {
  let child = ctx.children[0];
  let tokenType = child.getSymbol().type;
  let numeric = new NumericValue();
  let literal = child.toString();

  if (tokenType === HEROCLexer.CONSTANT) {

    if (literal.startsWith("\'")) {
      let string = new StringValue();
      string.isChar = true;
      string.value = literal.split("'")[1]; // unwrap quotes
      return string;
    } else if (literal.length > 1) {
      numeric.originalValue = literal;
      numeric.value = literal;
      if (literal.toLowerCase().startsWith("0x")) {
        numeric.value = parseInt(literal, 16);
      } else if (literal.startsWith("0")) {
        numeric.value = parseInt(literal, 8);
      }
      return numeric;
    } else {
      numeric.originalValue = literal;
      numeric.value = literal;
      return numeric;
    }

  } else if (tokenType === HEROCLexer.IDENTIFIER) {
    let identifier = new Identifier();
    identifier.name = literal;
    return identifier;
  } else if (tokenType === HEROCLexer.STRING) {
    let string = new StringValue();
    string.constantLabelIndex = this.constantLabelIndex++;
    string.value = literal.split('"').join("");
    return string;
  } else {
    return this.visit(ctx.children[1]);
  }

};

NodeVisitor.prototype.visitInitDeclaratorArray = function (ctx) {
  let array = new ArrayType();
  let identifier = new Identifier();
  identifier.parent = array;
  identifier.name = ctx.children[0].toString();
  let size = null;

  if (ctx.children[2] instanceof HEROCParser.ExpressionContext) {
    size = this.visit(ctx.children[2]);
  }

  let values = [];
  let initializerList = ctx.children.slice(3, 4)[0];
  if (initializerList instanceof HEROCParser.InitializerListContext) {
    array.isAssigned = true;
    values = this.visit(initializerList);
  }

  if (size === null) {
    size = new NumericValue();
    if (values.length > 0) {
      size.value = size.originalValue = values.length;
    }
  }

  array.identifier = identifier;
  array.size = size;

  array.pushStatements(values);

  return array;
};

NodeVisitor.prototype.visitInitializerList = function (ctx) {
  let values = [];

  ctx.children.forEach(child => {
    // skip unwanted commas
    if (child instanceof HEROCParser.InitializerContext) {
      values.push(this.visit(child));
    }
  });

  return values;
};

NodeVisitor.prototype.visitInitializer = function (ctx) {
  return this.visit(ctx.children[0]);
};

NodeVisitor.prototype.visitPostfixExpression = function (ctx) {
  if (ctx.children.length === 1) {
    return this.visit(ctx.children[0]);
  } else if (ctx.children.length === 2) {
    let operationType = ctx.children[1].getText();
    let operation = new PostfixOperation();
    operation.operation = operationType;
    operation.name = "Inc Dec";
    operation.pushStatement(this.visit(ctx.children[0]));
    return operation;
  } else if (ctx.children[1] instanceof HEROCParser.InitializerListContext) {
    let array = new ArrayType();
    let values = this.visit(ctx.children[1]);
    array.pushStatements(values);
    array.size.originalValue = array.size.value = values.length;
    array.isConstant = true;
    array.constantLabelIndex = this.constantLabelIndex++;
    return array;
  } else if (ctx.children[1].getSymbol().type === HEROCParser.LEFTBRACKET) {
    let operation = new PostfixOperation();
    operation.name = "Subscript";
    operation.operation = "[]";
    operation.pushStatement(this.visit(ctx.children[0]));
    operation.pushStatement(this.visit(ctx.children[2]));
    return operation;
  } else if (ctx.children[1].getSymbol().type === HEROCParser.LEFTPAREN) {
    return this.visitFunctionCallStatement(ctx);
  }
};

NodeVisitor.prototype.visitFunctionDefinition = function (ctx) {

  let functionDefinition = new FunctionDefinition();
  functionDefinition.functionLabelIndex = this.functionLabelIndex++;

  let identifier = new Identifier();
  identifier.name = ctx.children[0].toString();

  if (ctx.children.length === 5) {
    functionDefinition.pushArguments(this.visit(ctx.children[2]));
    functionDefinition.pushStatement(this.visit(ctx.children[4]));
  } else if (ctx.children.length === 4) {
    functionDefinition.pushStatement(this.visit(ctx.children[3]));
  }

  functionDefinition.identifier = identifier;

  return functionDefinition;
};

NodeVisitor.prototype.visitIdentifierList = function (ctx) {

  let identifiers = [];

  ctx.children.forEach(child => {
    let type = child.getSymbol().type;
    if (type === HEROCParser.IDENTIFIER) {
      let identifier = new Identifier();
      identifier.name = child.getText();
      identifiers.push(identifier);
    }
  });

  return identifiers;
};

NodeVisitor.prototype.visitCompoundStatement = function (ctx) {

  let block = new Block();

  if (ctx.children[1] instanceof HEROCParser.BlockItemListContext) {
    let items = this.visit(ctx.children[1]);
    items.forEach(item => {
      if (Array.isArray(item)) {
        // block.pushVariables(item);
        block.pushStatements(item);
      } else {
        block.pushStatement(item);
      }
    });
  }

  return block;
};

NodeVisitor.prototype.visitBlockItemList = function (ctx) {

  let items = [];

  ctx.children.forEach(child => {
    items.push(this.visit(child));
  });

  return items;
};

NodeVisitor.prototype.visitBlockItem = function (ctx) {
  return this.visit(ctx.children[0]);
};

NodeVisitor.prototype.visitStatement = function (ctx) {
  return this.visit(ctx.children[0]);
};

NodeVisitor.prototype.visitSelectionStatement = function (ctx) {

  let selection = new Selection();
  selection.type = "IF";

  selection.selectionLabelIndex = this.selectionLabelIndex++;

  if (ctx.children[2] instanceof HEROCParser.ExpressionContext) {
    selection.condition = this.visit(ctx.children[2]);
    selection.condition.parent = selection;
  }

  selection.ifBlock = this.visit(ctx.children[4]);
  selection.ifBlock.parent = selection;

  // is there else block?
  if (ctx.children.length > 5) {
    selection.elseBlock = this.visit(ctx.children[6]);
    selection.elseBlock.parent = selection;
  }

  return selection;
};

NodeVisitor.prototype.visitJumpStatement = function (ctx) {

  let jump = new Jump();
  let type = ctx.children[0].toString();

  jump.type = type.toUpperCase();

  if (ctx.children.length > 2) {
    jump.pushStatement(this.visit(ctx.children[1]));
  }

  return jump;
};

NodeVisitor.prototype.visitFunctionCallStatement = function (ctx) {

  let functionCall = new FunctionCall();
  functionCall.name = "Function Call";
  functionCall.operation = "()";

  let identifier;
  if (ctx.children[0].constructor.name === "TerminalNodeImpl") {
    identifier = new Identifier();
    identifier.name = ctx.children[0].getText();
  } else {
    identifier = this.visit(ctx.children[0]);
  }

  identifier.parent = functionCall;
  functionCall.identifier = identifier;

  if (ctx.children[2] instanceof HEROCParser.ArgumentExpressionListContext) {
    functionCall.pushStatements(this.visit(ctx.children[2]));
  } else if (ctx.children[2] instanceof HEROCParser.FunctionCallStatementContext) {
    functionCall.pushStatement(this.visit(ctx.children[2]));
  }

  return functionCall;

};

NodeVisitor.prototype.visitArgumentExpressionList = function (ctx) {
  let args = [];

  ctx.children.forEach(child => {
    if (child instanceof HEROCParser.ExpressionContext) {
      args.push(this.visit(child));
    }
  });

  return args;
};

NodeVisitor.prototype.visitIterationStatement = function (ctx) {

  let type = ctx.children[0].toString();
  let loop;

  if (type === "while") {
    loop = new WhileLoop();
  } else if (type === "do") {
    loop = new DoWhileLoop();
  } else if (type === "for") {
    loop = new ForLoop();
  }

  loop.loopLabelIndex = this.loopLabelIndex++;

  let i = 0;

  ctx.children.slice(1).forEach(child => {
    // skip terminals like comma etc.
    if (child.toString() === ";" || child.toString() === ")") {
      i++;
    }

    if (child.constructor.name !== "TerminalNodeImpl") {
      if (type === "for") {
        if (i === 0) {
          loop.init = this.visit(child);
          loop.init.parent = loop;
        } else if (i === 1) {
          loop.condition = this.visit(child);
          loop.condition.parent = loop;
        } else if (i === 2) {
          loop.step = this.visit(child);
          loop.step.parent = loop;
        } else {
          loop.pushStatement(this.visit(child));
        }
      } else {
        loop.pushStatement(this.visit(child));
      }
    }
  });

  return loop;

};


exports.NodeVisitor = NodeVisitor;
