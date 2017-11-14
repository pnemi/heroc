# HEROC Dokumentace

## Instalace

Překladač je napsán v jazyce JavaScript, respektive jeho frameworku NodeJS za použití knihovny antlr4, která z dodané gramatiky vygeneruje parser jazyka HEROC.

1. [Instalace Node.JS](https://nodejs.org/en/download/package-manager/)
2. Ve složce projektu heroc: ```$ cd ~/heroc```
3. Instalace potřebných balíčků: ```$ npm install``` (Balíčky jsou již přiloženy v projektu ve složce /node_modules)


## Použití

1. Ve složce projektu heroc: ```$ cd ~/heroc```
2. Spuštění překladu:
  * ```$ node heroc [filename]``` (kde filename je název souboru s kódem v jazyce HEROC, výstup bude zapsán do stejného umístění jako vstup s příponou ```*.s```)
  * ```$ node heroc [filename] ast``` (druhý parametr, který pro vstup navíc vygeneruje i AST)

Výstupem překladu je soubor ```[filename].s```. Cílová platforma je x86-64 assembler v notaci GAS. Vygenerovaný kód (```kod.s```) spolu s implementací výstupních funkcí (```herocio.c```), která se nachází v kořenové složce projektu, lze do spustitelného souboru (```output```) přeložit příkazem ```$ gcc -m64 -o output kod.s herocio.c```.

## Struktura projektu

### /asm/Printer.js
Implementace řetězcového bufferu poskytující abstrakci pro akumulaci a vypisování kódu assemblerových operací a direktiv. Obsahuje mapu názvů binárních, unárních a postfixových assemblerových operací pro symboly operací jazyka HEROC.

#### /docs/*
Zadání, požadavky a dokumentace projektu překladače HEROC.

### /grammar/target/generated-sources/antlr4/*
JavaScriptový parser pro lexikální a syntaktickou analalýzu jazyka HEROC vygenerovaný nástrojem antlr4, který sestavuje a prochází parsovací strom.

### /grammar/HEROC.g4
Parsovací pravidla gramatiky HEROC pro syntaktickou analýzu.

### /grammar/HEROCElements.g4
Lexikální prvky gramatiky HEROC pro lexikální analýzu.

### /heroc_examples/example[1-40].heroc
### /heroc_examples/example[1-40].txt
Příklady zdrojových kódů a jejich očekávaných výsledků jazyka HEROC reflektující požadavky na funkce překladače. Operaci ```b + 10``` v příkladech číslo 21 a 22 jsem opravil na ```b + 10 * sizeof(long)```.

### /heroc_examples/example[1-40]\_AST.txt
Abstraktní syntaktický strom interní formy zdrojového programu příslušného příkladu.

### /heroc_examples/example[1-40]\.s
Přeložený příslušný zdrojový kód příkladu jazyka HEROC do kódu assembleru připravený ke kompilaci. Překladač přeložil vše s očekávanými výsledky (s vyjímkou příkladů číslo 25, 26, 33 a 39).

### /node_modules
Obsahuje balíčky, na kterých je projekt závislý.

### /node_modules/antlr4
Nástroj na generování parseru z pravidel gramatiky. http://www.antlr.org

### /node_modules/fs
Modul pro čtení a zápis souborů na disk.

### heroc
Spouštěcí soubor překladače HEROC. Přečte zdrojový soubor jazyka HEROC z parametru konzole, přečte ho a předá knihovně antlr4 na lexikální a syntaktickou analýzu. Výstupem antlr4 je poté tzv. parsovací strom, který později zpracovávám do interní podoby abstraktního syntaktického stromu.

### compile_all
Pomocný soubor pro zkompilování všech příkladů přeložených do assembleru.

### Visitory

#### /visitors/NodeVisitor.js
Antlr4 podle gramatiky vytváří parsovací strom, jehož struktura odpovídá cestám průchodu jeho pravidel. Vytvoření abstraktního syntaktického stromu (AST) probíhá ve mnou přepsáném prototypu tzv. visitoru knihovny antlr4, což je jeden ze způsobů, jakým antlr4 umí procházet výstupní parsovací strom. Při průchodu tohoto parsovacího stromu dochází k vytváření AST, jehož uzly odpovídají elementům jazyka HEROC (např.: cyklus, funkce nebo blok). Již při sestavování AST, NodeVisitor přidává do instancí cyklů, funkcí a podmínek index, který slouží k pojmenování assemblerových direktiv začátku a konce kódových sekcí.

#### /visitors/AST.js
Kořenový prototyp AST. Pouze za účelem abstrakce. Uchovává si pouze jednu instanci Node.

#### /visitors/Node.js
Abstraktní prototyp uzlu AST pro prototypovou dědičnost. Každý nekořenový uzel AST si uchovává tzv. statements, což jsou elementy jazyka odpovídající potomkům tohoto uzlu v AST. Samotná instance Node se vytváří pouze jedna a uchovávají se v ní globální proměnné (proměnné globálního rozsahu) a konstanty (pole a řetězcové literály), které jsou v assembleru umístěny do sekce direktivy ```.data```. Definuje metody pro vytisknutí AST (```print```, ```printStatements```, ...) a přeložení kódu HEROC do assembleru (```printCode```).

#### /visitors/Variable.js
Abstraktní prototyp proměnných pro prototypovou dědičnost. Každá proměnná uchovává svůj identifikátor a příznak, který udává, je-li deklarovaná proměnná rovnou i inicializována.

#### /visitors/PrimitiveType.js
Prototyp proměnné primitivního typu. Metody ```getGloblCode``` a ```getGloblValues``` vytvářejí kód výhradně pro globální proměnné pomocí direktiv v sekci ```.data```. Metoda ```printCode``` se stará o ty lokální, které přidává, spolu s offsetem na zásobníkovém rámci, do tabulky rodičovského (v AST) bloku.

#### /visitors/ArrayType.js
Prototyp proměnné primitivního typu. Rovněž implementuje zmíněné metody jako ```PrimitiveType```. Navíc však udržuje příznak, zda se jedná o (nepojmenovanou) konstantu pole – v takovém případě se k ní chovám jako ke globální proměnné zapsané do kódu assembleru v sekci ```.data``` jejiž název udává direktiva ```.LC``` následovaná přiřazeným indexem konstanty.

#### /visitors/NumericValue.js

Prototyp numerické hodnoty. Jelikož v jazyce HEROC je povolen zápis čísla i v jiných soustavách, než v desítkové, uchovává, jak tu původní hodnotu ze zdrojového kódu, tak i její dekadickou reprezentaci – převod se děje již na úrovni ```NodeVisitoru```.

#### /visitors/StringValue.js

Prototyp pro konstantní řetězcové hodnoty a znaky. Uchovává index štítku používaný u konstant (```.LC```). Řetězcové konstanty kompilátor gcc uvozuje direktivou ```.string```. Jelikož je však v jazyce HEROC všechno 8 bajtový long, chovám se k řetězcům jako k poli znaků, a ke každému znaku jako "čtyřslovu" (direktiva ```.quad```), aby s řetězci mohli fungovat stávající instrukce operací. Každý znak tedy odpovídá pozici v tabulce ASCII (např.: 'a' => ```.quad 97```).

#### /visitors/Identifier.js

Prototyp identifikátoru proměnných. Uchovává název proměnné a poskytuje metody související s jejich platností. Metoda ```getStackFrameOffset``` (resp. ```setStackFrameOffset```) slouží k získání (resp. nastavení) pozice posunutí na zásobníkovém rámci funkce v podobě počtu bajtů. Metoda ```getSymbolOffset``` zjišťuje tento offset pro daný identifikátor v tabulce vazeb, způsobem klíč (název) => hodnota (offset), průchodem AST směrem nahoru – narazí-li na blok, zjistí, zda uchovává v tabulce tento identifikátor a vrátí jeho offset s postfixem ```(%rbp)```, jelikož je proměnná lokální, najde-li vazbu v tabulce kořenové instance AST, je proměnná globální a vrátí ji s postfixem ```(%rip)```, v opačném případě proměnná nebyla nalezena a uživatel je informován, že je nedefinována. Metoda ```isSymbolGlobal``` rovněž hledá proměnnou v tabulkách stylem bottom-up, tentokrát však oznamuje, zda je symbol globální (čili byla nalezena vazba až v kořenové instanci AST).

#### /visitors/FunctionDefinition.js

Prototyp funkce. Obsahuje svůj identifikátor a index štítku assemblerové direktivy pro začátek a konec funkce (```.LFB``` a ```.LFE```). Jelikož při volání funkce dochází k vytvoření zásobníkového rámce, v instancích tohoto prototypu je uloženo číslo reprezentující počet bajtů aktuálního offsetu rámce, který se dekrementuje při deklaracích lokálních proměnných.

Argumenty, které jsou předány funkci při volání jsou díky metodě ```getArgsCode``` z registrů přesunuty rovněž na zásobník a zachází se s nimi, jako s lokálními proměnnými (protože docházelo k přepisování hodnot registrů u některých příkladů rekurze).


Jelikož tělem funkce je instance bloku, která může rovněž obsahovat další vnořené bloky, volá se rekurzivně metoda prototypu bloku, která nejprve zřetězí veškerý kód uvnitř funkce a poté ho vrátí do metody ```printCode``` prototypu funkce. Tímto způsobem lze navíc provést dvě věci na této úrovni. Zjistit, zda se někde ve funkci nachází výraz ```return``` – v případě, že ne, přidá se na konec funkce instrukce přesunu nuly na registry ```rax``` pro indikaci úspěšného návratu z funkce suplující tento chybějící, nepovinný výraz. Rovněž lze zjistit, kolik je v celé funkci výskytů deklarací proměnných – kolik místa celkově bude nutné alokovat (odečíst patřičný počet bajtů od ukazatele v registru ```rsp```), což je možné udělat již na začátku bloku samotné funkce najednou (jedná se jednu z optimalizací) – vyjímkou jsou podmíněné bloky cyklů a podmínek, které se o toto starají samy.

#### /visitors/FunctionCall.js

Prototyp výrazu volání funkce. Identifikátor udává název volané funkce. Dodržuje se zde volací konvence x64 cdecl. Čili prvních šest argumentů je umístěno do registrů ```rdi```, ```rsi```, ```rdx```, ```rcx```, ```r8``` a ```r9```. Zároveň hodnoty těchto "callee unsave" registrů umístí před voláním (instrukcí ```call```) na zásobník (pro jednoduchost všechny) metodou ```getPushRegistersCode``` a poté vrátí zpět pomocí ```getPopRegistersCode```. Metoda ```getArgsCode``` umisťuje hodnoty identifikátorů argumentů (případně výsledky operací) z registru ```rax``` do registru pro předávané argumenty.

#### /visitors/Block.js

Prototyp bloku. Ty představují zejména (lokální) jmenný prostor deklarovaných proměnných, které ukládá do své tabulky symbolů způsobem klíč (název) => hodnota (offset na zásobníkovém rámci).

U funkcí zmiňovaná hromadná alokace místa na zásobníku zde probíhá v členské metodě ```pushAllocCode```, která vrací instrukci pro alokaci potřebného místa na zásobníku s počtem bajtů standartně zarovnaných nahoru na násobek 16 kvůli.

Rovněž u funkcí zmiňovaná rekurzivní akumulace kódu se odehrává v metodě ```printCode```. Jelikož je vše 8 bajtový long, čítač proměnných se inkrementuje o 1, narazí-li v bloku na primitivní typ. Jde-li o pole, inkrementuje se o jeho velikost o jedna vyšší (pro jeho ukazatel). Najde-li instanci skoku typu return, změní příznak výskytu výrazu návratu z funkce na pravdivý.


#### /visitors/Operation.js

Abstraktní prototyp operací pro prototypovou dědičnost. Operace jsou rozděleny na tři typy:

1. Binární (operand, operace, operand)
2. Unární (operace, operand)
3. Postfixová (operand, operace)

Každá operace si vede informace o názvu svého typu a symbol operace, který je v ```/asm/Printer.js``` namapován na assemblerovou instrukci.

#### /visitors/BinaryOperation.js

Prototyp binární operace. Základní ideou zpracování binární operace je zásobník. Metoda ```makeOperationStack``` kopíruje myšlenku algoritmu shunting-yard, který převádí výrazy binární operace z infixové notace do reverzní polské notace (RPN), zásobník převedený do tvaru – první operand, druhý operand, operace – je zpracováván následujícím způsobem:

1. Zpracuj první operand a přidej ho na zásobník
2. Zpracuj druhý operand a přidej ho na zásobník
3. Přečti hodnoty operandů ze zásobníku do pracovních registrů (použity zejména ```%r10``` a ```%r11```) a použij s nimi instrukci dané operace

Jelikož je binárních operací celá řada, muselo podlehnout vytváření a zpracování do RPN různým vyjímkám, zejména u operace přiřazení, která v metodě ```getAssignmentCode``` musí prověřit typ levého operandu, do kterého se přiřazuje hodnota pravého operandu.

Narazí-li se na RPN zásobníku na binární operaci, volá se metoda ```getOperationCode```, která ze symbolu operace identifikuje správnou instrukci assebmleru a poté volá příslušnou obsluhu operace. Speciální zacházení vyžadují operace bitového posunu (```getShiftCode```), modulo (```getModuloCode```), dělení (```getDivisionCode```), logické (```getLogicalCode```) a relační (```getRelationalCode```). Ostatní operace podléhají generické obsluze (```getGenericCode```).

#### /visitors/UnaryOperation.js

Prototyp unární (prefixové) operace. Zde se rovněž provádí identifikace instrukce a obsluhy operace podle jejího symbolu.

#### /visitors/PostfixOperation.js

Prototyp postfixové operace. Zde, kromě postfixové verze operace inkrementace a dekrementace, hraje hlavní roli operace dereference pole, která se zpracovává v metodě ```getArrayCode``` . Je třeba rozlišit, zda je pole konstantou anebo globálního či lokálního rozsahu.

Operace volání funkce je rovněž operací postfixovou, ta se však musí dramaticky jinak zpracovat, proto dostala vlastní prototyp ```/visitors/FunctionCall.js```.

#### /visitors/Loop.js

Abstraktní prototyp smyček pro prototypovou dědičnost. Uchovává index štítku direktiv začátku a konce prováděného bloku (```.LB``` a ```.LE```). Kromě toho ještě prototyp uchovává odkaz na výraz podmínky, která rozhoduje o provedení resp. neprovedení bloku.

#### /visitors/ForLoop.js

Prototyp smyčky for, který je rozšířen o odkazy na výrazy inicializace a výrazy prováděné v každém kroku smyčky. Prototyp musí mít tyto sloty mimo klasický seznam výrazů – to se provádí již na úrovni sestavování AST, kde se tyto výrazy přiřadí díky pozici středníku při průchodu parsovacího stromu – protože jinak není jasné, jaký výraz je inicializační, jaký je podmínkou a jaký je krokem. Je zohledněno i to, že kterýkoliv z těchto výrazů je nepovinný.

#### /visitors/WhileLoop.js

Prototyp smyčky while je oproti tomu přímočarý. Obsahuje dva výrazy z čehož je první jistě podmínka a druhým je blok.

#### /visitors/DoWhileLoop.js

Smyčka do while má pořadí těchto výrazů oproti while naopak.

#### /visitors/Jump.js

Prototyp výrazu skoku je rozlišován ještě svým typem:

1. return
2. break
3. continue

V případě výrazu return, který se může mj. vyskytnout v těle funkce několikrát a ve vnořených blocích, je zajištěno, aby byla jeho návratová hodnota umístěna na ```%rax``` a provedl se skok až na konec funkce uvozený direktivou ```.RET``` následovanou indexem funkce.

Je-li výraz skoku typu break resp. continue, je v AST vyhledán rodičovská smyčka a provede se skok za danou smyčku na konec (direktiva ```.LE``` s indexem smyčky) resp. zpět na začátek bloku dané smyčky (```.LB```).

#### /visitors/Selection.js

Prototyp selekce se věnuje výrazům typu if (s nepovínou else větví) i ternárnímu operátoru. Uchovává si odkazy na výrazy podmínky a blokům, který se provede při splnění resp. nesplnění této podmínky.
