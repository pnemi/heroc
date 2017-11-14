lexer grammar HEROCElements;

/**
 * HEROC Lexer Rules Identifiers.
 */

// KEYWORDS

BREAK :	'break';
CONTINUE : 'continue';
DO : 'do';
ELSE : 'else';
FOR : 'for';
IF : 'if';
LONG : 'long';
RETURN : 'return';
SIZEOF : 'sizeof';
WHILE : 'while';

KEYWORDS
	:	BREAK
	|	CONTINUE
	|	DO
	|	ELSE
	|	FOR
	|	IF
	|	LONG
	|	RETURN
	|	SIZEOF
	|	WHILE
	;

// OPERATORS

NOT : '!';
NOTEQUAL : '!=';
MOD : '%';
MODASSIGN : '%=';
AND : '&';
ANDAND : '&&';
ANDASSIGN : '&=';
STAR : '*';
STARASSIGN : '*=';
PLUS : '+';
PLUSPLUS : '++';
PLUSASSIGN : '+=';
MINUS : '-';
MINUSMINUS : '--';
MINUSASSIGN : '-=';
DIV : '/';
DIVASSIGN : '/=';
COLON : ':';
LESS : '<';
LEFTSHIFT : '<<';
LEFTSHIFTASSIGN : '<<=';
LESSEQUAL : '<=';
ASSIGN : '=';
EQUAL : '==';
GREATER : '>';
GREATEREQUAL : '>=';
RIGHTSHIFT : '>>';
RIGHTSHIFTASSIGN : '>>=';
QUESTION : '?';
CARET : '^';
XORASSIGN : '^=';
OR : '|';
ORASSIGN : '|=';
OROR : '||';
TILDE : '~';


// AUXILIARY CHARACTERS

LEFTPAREN : '(';
RIGHTPAREN : ')';
LEFTBRACKET : '[';
RIGHTBRACKET : ']';
LEFTBRACE : '{';
RIGHTBRACE : '}';
SEMI : ';';
COMMA:	',';

// OTHER


IDENTIFIER
	:  IDPREFIX (IDPREFIX | DIGIT)*
	;

fragment
DIGIT
	:	[0-9]
	;

fragment
IDPREFIX
	:	('_' | LETTER)
	;

fragment
LETTER
	:	[a-zA-Z];

CONSTANT
	:	INTEGERCONSTANT
	|	CHARACTERCONSTANT
	;

fragment
INTEGERCONSTANT
	:	DECIMALCONSTANT
	|	OCTALCONSTANT
	|	HEXADECIMALCONSTANT
	;

DECIMALCONSTANT
	:	DIGIT+
	;

OCTALCONSTANT
	:	'0' OCTALCONSTANT+
	;

HEXADECIMALCONSTANT
	:	HEXPREFIX HEXDIGIT+
	;

fragment
HEXPREFIX
	:	'0' [xX]
	;

fragment
NONZERODIGIT
	:	[1-9]
	;

fragment
OCTALDIGIT
	:	[0-7]
	;

fragment
HEXDIGIT
	:	[0-9a-fA-F]
	;

CHARACTERCONSTANT
	:	'\'' CHARSYMBOL '\''
	;


STRING : '"' (options{greedy=false;}:( ~('\\'|'"') | ('\\' '"')))* '"';


fragment
ESCAPE
	:	'\\t'
	;

fragment
CHARSYMBOL
	:	'\u0000' .. '\u007F'
	;

WHITESPACE
	:	[ \t]+
		-> skip
	;

NEWLINE
	:	( '\r' '\n'?
	|	'\n' )
		-> skip
	;

BLOCKCOMMENT
	:	'/*' .*? '*/'
		-> skip
	;
