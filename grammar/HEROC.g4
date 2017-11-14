grammar HEROC;
import HEROCElements;

options {
	language = JavaScript;
}

program
	:	externalDeclaration? EOF
	;

externalDeclaration
	:	declaration
	|	functionDefinition
	|	externalDeclaration declaration
	|	externalDeclaration functionDefinition
	;

/**
 * VARIABLES (PRIMITIVE & ARRAY)
 */

declaration
	:	'long' initDeclaratorList ';'
	;

initDeclaratorList
	:	initDeclarator (',' initDeclarator)*
	;

initDeclarator
	:	pointer? initDeclaratorArray
	|	pointer? initDeclaratorPrimitive
	;

pointer
	:	'*'
	;

initDeclaratorPrimitive
	:	IDENTIFIER
	|	IDENTIFIER '=' expression
	;

initDeclaratorArray
	:	IDENTIFIER ('[' expression? ']')+
	|	IDENTIFIER '=' '{' (initializerList)? '}'
	;

initializer
	:	expression
	|	'{' initializerList '}'
	|	'{' initializerList ',' '}'
	;

initializerList
	:	initializer (',' initializer)*
	;


/**
 * FUNCTIONS
 */

functionDefinition
	:	IDENTIFIER '(' identifierList? ')' compoundStatement
	;

identifierList
	:	IDENTIFIER (',' IDENTIFIER)*
	;

/**
 * EXPRESSIONS
 */

primaryExpression
	:	IDENTIFIER
	|	CONSTANT
	|	STRING
	|	'(' expression ')'
	;

postfixExpression
	:	primaryExpression
	|	postfixExpression '[' expression ']'
	|	postfixExpression '(' argumentExpressionList? ')'
	|	postfixExpression '++'
	|	postfixExpression '--'
	|	'{' initializerList '}'
	|	'{' initializerList ',' '}'
	;

unaryExpression
	:	postfixExpression
	|	unaryOperator unaryExpression
	|	'sizeof' '(' 'long' ')'
	;

unaryOperator
	:	'&' | '*' | '+' | '-' | '~' | '!' | '++' | '--'
	;

multiplicativeExpression
	:	unaryExpression
	|	multiplicativeExpression '*' unaryExpression
	|	multiplicativeExpression '/' unaryExpression
	|	multiplicativeExpression '%' unaryExpression
	;

additiveExpression
	:	multiplicativeExpression
	|	additiveExpression '+' multiplicativeExpression
	|	additiveExpression '-' multiplicativeExpression
	;

shiftExpression
	:	additiveExpression
	|	shiftExpression '<<' additiveExpression
	|	shiftExpression '>>' additiveExpression
	;

relationalExpression
	:	shiftExpression
	|	relationalExpression '<' shiftExpression
	|	relationalExpression '>' shiftExpression
	|	relationalExpression '<=' shiftExpression
	|	relationalExpression '>=' shiftExpression
	;

equalityExpression
	:	relationalExpression
	|	equalityExpression '==' relationalExpression
	|	equalityExpression '!=' relationalExpression
	;

andExpression
	:	equalityExpression
	|	andExpression '&' equalityExpression
	;

exclusiveOrExpression
	:	andExpression
	|	exclusiveOrExpression '^' andExpression
	;

inclusiveOrExpression
	:	exclusiveOrExpression
	|	inclusiveOrExpression '|' exclusiveOrExpression
	;

logicalAndExpression
	:	inclusiveOrExpression
	|	logicalAndExpression '&&' inclusiveOrExpression
	;

logicalOrExpression
	:	logicalAndExpression
	|	logicalOrExpression '||' logicalAndExpression
	;

conditionalExpression
	:	logicalOrExpression ('?' expression ':' conditionalExpression)?
	;

expression
	:	conditionalExpression
	|	unaryExpression assignmentOperator expression
	|	functionCallStatement
	;

assignmentOperator
	:	ASSIGN
	|	STARASSIGN
	|	DIVASSIGN
	|	MODASSIGN
	|	PLUSASSIGN
	|	MINUSASSIGN
	|	LEFTSHIFTASSIGN
	|	RIGHTSHIFTASSIGN
	|	ANDASSIGN
	|	XORASSIGN
	|	ORASSIGN
	;

constantExpression
	:	conditionalExpression
	;

/**
 * STATEMENTS & BLOCKS
 */

statement
	:	functionCallStatement ';'
	|	compoundStatement
	|	expressionStatement
	|	selectionStatement
	|	iterationStatement
	|	jumpStatement
	;

compoundStatement
	:	'{' blockItemList? '}'
	;

blockItemList
	:	blockItem+
	;

blockItem
	:	declaration
	|	statement
	;

functionCallStatement
	:	IDENTIFIER '(' (argumentExpressionList | functionCallStatement)? ')'
	;

argumentExpressionList
	:	expression (',' expression)*
	;

expressionStatement
	:	expression? ';'
	;

selectionStatement
	:	'if' '(' expression ')' compoundStatement ('else' compoundStatement)?
	;

iterationStatement
	:	'while' '(' expression ')' statement
	|	'do' statement 'while' '(' expression ')' ';'
	|	'for' '(' expression? ';' expression? ';' expression? ')' statement
	|	'for' '(' declaration expression? ';' expression? ')' statement
	;

jumpStatement
	:	'continue' ';'
	|	'break' ';'
	|	'return' expression? ';'
	;
