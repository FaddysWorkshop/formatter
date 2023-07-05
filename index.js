import Formatter from "./formatter.js";
import Scenarist from "scenarist.dev";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { writeFileSync } from "fs";
const options = yargs ( hideBin ( process .argv ) )

 .usage ( "Usage: -p <path>" )
 .option ( "p", { alias : "path", describe : "File to be formatted", type : "string", demandOption : true } )
 .boolean ( "write" ) .alias ( 'write', [ 'w' ] ) .describe ( 'write', "Whether to overwrite file with formatted version" ) .argv;
const play = Scenarist ( new Formatter () );
const output = play ( options .path );

if ( options .write ) {

writeFileSync ( options .path, output )

} else {

console .log ( output );

}
