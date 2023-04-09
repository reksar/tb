/*
 * Generates hexline of {byte_count} "xHH" triplets representing a random byte
 * in range {min_byte} .. {max_byte} and writes it to the {outfile}:
 *
 *   cscript random-hexline.js {byte_count} {min_byte} {max_byte} {outfile}
 *
 *   cscript random-hexline.js 3333 0 255 hexline.txt
 *
 * Splits the generated hexline into hexlines so that each line does not exceed
 * the line length limit for cmd.
 */

FS = new ActiveXObject("Scripting.FileSystemObject");
TEST_DIR = FS.GetParentFolderName(WScript.ScriptFullName);

var util = eval(FS.OpenTextFile(FS.BuildPath(TEST_DIR, "util.js")).ReadAll());


var byte_count = parseInt(WScript.Arguments(0));
var min_byte = parseInt(WScript.Arguments(1));
var max_byte = parseInt(WScript.Arguments(2));
var outfile = WScript.Arguments(3);

if (byte_count <= 0)
  throw new Error("Invalid byte_count!");
if (min_byte < 0 || util.MAX_BYTE < min_byte)
  throw new Error("Invalid min_byte!");
if (max_byte < min_byte || util.MAX_BYTE < max_byte)
  throw new Error("Invalid max_byte!");


var random_bytes = new RandomGenerator(byte_count, min_byte, max_byte);
var hexlines = new util.HexLineGenerator(random_bytes);

var file = FS.CreateTextFile(outfile, /*rewrite*/true);

while (!hexlines.Empty())
  file.WriteLine(hexlines.Next());

file.Close();


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
