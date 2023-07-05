import "fs";
import { readFileSync } from "fs";
import jsTokens from "js-tokens";
import Scenarist from "scenarist.dev";
const NonSpecialToken = "NonSpecialToken";
const LineFormatter = "LineFormatter";
const left = {

"]" : "[",
")" : "(",
"}" : "{",

};

const declarationKeyWords = [ "var", "let", "const" ];
const assignmentOperators = [

"=",
"+=",
"-=",
"*=",
"/=",
"%=",
"**=",
"<<=",
">>=",
">>>=",
"&=",
"^=",
"|=",
"&&=",
"||=",
"??=",
];
const PunctuatorType = {

":" : "Colon",
"++" : "IncrementDecrement",
"--" : "IncrementDecrement",
";" : "SemiColon",
"," : "Comma",
"[" : "OpeningSquareBracket",
"]" : "Closing",
"}" : "Closing",
")" : "Closing",

}

export default class Formatter {

lines = [];

// the director reads a new file and formats it, or handles non-special tokens
$_director ( play, input, token ) {

if ( typeof input === "symbol" ) {

play ( Symbol .for ( NonSpecialToken ), token );

return;

}

const { lines } = this;
const path = input;
const fileLines = readFileSync ( path, "utf8" ) .split ( /\r?\n/ );

for ( const line of fileLines ) {

play ( Symbol .for ( LineFormatter ), line .trim () );

}

return lines
 .map ( ( line ) =>
line
 .map ( ( token ) => token .formattedValue || token .value )
 .join ( "" )
)
 .join ( "\n" ) + "\n";

}

// the line formatter splits a line into tokens, calls the corresponding symbol direction for each token
$_LineFormatter ( play, line ) {

if ( line == "" ) {

return

}

const { lines } = this;
const tokens = jsTokens ( line );

lines .push ( [] );
for ( const token of tokens ) {

if ( token .done ) break;
play ( Symbol .for ( token .type ), token, lines );

}

this .processNewLine ();

}

$_NonSpecialToken ( play, token ) {

const { lines } = this;
const line = lines .at ( - 1 );
const lastToken = line .at ( - 1 );

if ( lastToken ) {

token .formattedValue = " " + token .value;

}

line .push ( token );

}

$_IdentifierName ( play, token ) {

const { lines } = this;
const line = lines .at ( - 1 );
const lastToken = line .at ( - 1 );

if ( lastToken ) {

if ( lastToken .value !== "." && lastToken .value !== "?." ) {

token .formattedValue = " " + token .value;

}

}

line .push ( token );

}

$_Punctuator ( play, token ) {

const { lines } = this;
const line = lines .at ( - 1 );
const p = Scenarist ( new Punctuator () )

p ( token, line )

// play(Scenarist(new Punctuator()), token, line)

}

$_MultiLineComment ( play, token ) {

const { lines } = this;
const line = lines .at ( - 1 );

line .push ( token );

}

$_SingleLineComment ( play, token ) {

const { lines } = this;
const line = lines .at ( - 1 );

line .push ( token );

}

processNewLine () {

const { lines } = this;

if ( lines .length == 1 ) {

return;

}

const lastLine = lines .at ( - 1 );
const nextToLastLine = lines .at ( - 2 );

if (

this .isBlockOpenning ( nextToLastLine ) ||
this .isBlockClosing ( lastLine ) ||
this .isBlockClosed ( nextToLastLine ) ||
this .haveAssignmentsEnded ( nextToLastLine, lastLine ) ||
this .haveDeclarationsEnded ( nextToLastLine, lastLine ) ||
this .haveFunctionCallsEnded ( nextToLastLine, lastLine )
) {

nextToLastLine .push ( {

type : "LineTerminatorSequence",
value : "\n",

} );

}

}

$_LineTerminatorSequence ( play, token ) {

// skip

}

$_WhiteSpace ( play, token ) {

// skip

}

isBlockClosed ( nextToLastLine ) {

return nextToLastLine .length > 0 && nextToLastLine [ 0 ] .value == "}";

}

isLastLineNewLine ( nextToLastLine ) {

return (

nextToLastLine .length > 0 &&
nextToLastLine [ 0 ] .type == "LineTerminatorSequence"
);

}

isBlockOpenning ( nextToLastLine ) {

const len = nextToLastLine .length;

return len > 0 && nextToLastLine .at ( - 1 ) .value === "{";

}

isBlockClosing ( lastLine ) {

return lastLine .length > 0 && lastLine [ 0 ] .value == "}";

}

haveDeclarationsEnded ( nextToLastLine, lastLine ) {

return (

nextToLastLine .length > 0 &&
lastLine .length > 0 &&
declarationKeyWords .includes ( nextToLastLine [ 0 ] .value ) &&
 ! declarationKeyWords .includes ( lastLine [ 0 ] .value )
);

}

haveAssignmentsEnded ( nextToLastLine, lastLine ) {

return (

nextToLastLine .length > 1 &&
assignmentOperators .includes ( nextToLastLine [ 1 ] .value ) &&
 ( lastLine .length < 2 ||
 ! assignmentOperators .includes ( lastLine [ 1 ] .value ) )
);

}

haveFunctionCallsEnded ( nextToLastLine, lastLine ) {

return (

nextToLastLine .length > 1 &&
nextToLastLine [ 1 ] .value == "(" &&
 ( lastLine .length < 2 || lastLine [ 1 ] .value != "(" )
);

}

}

class Punctuator {

$_director ( play, input1, input2, input3 ) {

if ( typeof input1 === "symbol" ) {

input2 .formattedValue = " " + input2 .value;
input3 .push ( input2 )
return

}

play ( Symbol .for ( PunctuatorType [ input1 .value ] ), input1, input2 )

}

$_Colon ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );
if ( lastToken === undefined ) {

return;

}

const nextToLastToken = line .at ( - 2 );

if (

lastToken .type !== "IdentifierName" ||
 ! [ "{", "," ] .includes ( nextToLastToken ?.value )
) {

token .formattedValue = " " + token .value;

}

}

$_IncrementDecrement ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );
if ( lastToken === undefined ) {

return;

}

if ( lastToken ?.type !== "IdentifierName" ) {

token .formattedValue = " " + token .value;

}

}

$_SemiColon ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );

}

$_Comma ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );

}

$_OpeningSquareBracket ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );
if ( lastToken === undefined ) {

return;

}

if ( lastToken ?.value !== "?." ) {

token .formattedValue = " " + token .value;

}

}

$_Closing ( play, token, line ) {

const lastToken = line .at ( - 1 );

line .push ( token );
if ( lastToken === undefined ) {

return;

}

if ( lastToken ?.value !== left [ token .value ] ) {

token .formattedValue = " " + token .value;

}

}

}
