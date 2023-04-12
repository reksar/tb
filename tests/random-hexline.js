/*
 * Generates hexline of {byte_count} "xHH" triplets representing a random byte
 * in range {min_byte} .. {max_byte} and writes it to the {outfile}:
 *
 *   cscript random-hexline.js {byte_count} {min_byte} {max_byte} {outfile}
 *
 *   cscript random-hexline.js 5000 0 255 hexline.txt
 *
 * Splits the generated hexline into parts so that each line does not exceed
 * the line length limit for cmd.
 */

FS = new ActiveXObject("Scripting.FileSystemObject");

var lib = ImportLib();


// Parse args {{{
var byte_count = parseInt(WScript.Arguments(0));
var min_byte = parseInt(WScript.Arguments(1));
var max_byte = parseInt(WScript.Arguments(2));
var outfile = WScript.Arguments(3);

if (byte_count <= 0)
  throw new Error("Invalid byte_count!");
if (min_byte < 0 || lib.MAX_BYTE < min_byte)
  throw new Error("Invalid min_byte!");
if (max_byte < min_byte || lib.MAX_BYTE < max_byte)
  throw new Error("Invalid max_byte!");
// }}}


var random_bytes = new RandomGenerator(byte_count, min_byte, max_byte);
var hexlines = new lib.HexlineGenerator(random_bytes);

with (FS.CreateTextFile(outfile, /*rewrite*/true))
  while (!hexlines.Empty())
    WriteLine(hexlines.Next());


// Helpers {{{
function RandomGenerator(count, min, max) {

  // Precalculation.
  var range = max - min;

  var i = 0;

  this.Empty = function() {
    return count <= i;
  }

  this.Next = function() {
    return ++i && Math.round(Math.random() * range) + min;
  }
}


function ImportLib() {
  var tests = FS.GetParentFolderName(WScript.ScriptFullName);
  var root = FS.GetParentFolderName(tests);
  var module = FS.BuildPath(root, "lib.js");
  return eval(FS.OpenTextFile(module).ReadAll());
}
// }}}
