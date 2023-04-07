/*
 * Generates hexline of {byte_count} "xHH" triplets representing a random byte
 * in the range {min_byte} .. {max_byte} and writes it to the {outfile}:
 *
 *   cscript random-hexline.js {byte_count} {min_byte} {max_byte} {outfile}
 *
 *   cscript random-hexline.js 3333 0 255 hexline.txt
 *
 * Splits the generated hexline into hexlines so that each line does not exceed
 * the line length limit for cmd.
 *
 * NOTE: line length limit for cmd is 8191 or 8191 / 3 = 2730 "xHH" triplets.
 * `MAX_TRIPLET_COUNT` is set to 2000 "xHH" triplets or 2000 * 3 = 6000 chars
 * per line (excluding CRLF). The remaining 8191 - 6000 = 2191 chars will be
 * free for the remaining cmd.
 * See https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
 */

HEX_BASE = 16;
MAX_BYTE = 255;
MAX_TRIPLET_COUNT = 2000; // per line

// See https://learn.microsoft.com/en-us/previous-versions/d5fk67ky(v=vs.85)#remarks
WindowStyle = {Hide: 0 /*...*/};


byte_count = parseInt(WScript.Arguments(0));
min_byte = parseInt(WScript.Arguments(1));
max_byte = parseInt(WScript.Arguments(2));
outfile = WScript.Arguments(3);

if (byte_count <= 0)
  throw new Error("Invalid byte_count!");
if (min_byte < 0 || MAX_BYTE < min_byte)
  throw new Error("Invalid min_byte!");
if (max_byte < min_byte || MAX_BYTE < max_byte)
  throw new Error("Invalid max_byte!");

// Precalculation for random `byte` generation in `RandomHexline`.
byte_range = max_byte - min_byte;


file = new ActiveXObject("Scripting.FileSystemObject")
  .CreateTextFile(outfile, /*rewrite*/true);

filled_lines_count = Math.floor(byte_count / MAX_TRIPLET_COUNT);

for (var i = 0; i < filled_lines_count; i++)
  file.WriteLine(RandomHexline(MAX_TRIPLET_COUNT));

if (remaining_count = byte_count % MAX_TRIPLET_COUNT)
  file.WriteLine(RandomHexline(remaining_count));

file.Close();


function RandomHexline(triplet_count) {
  var hexline = "";
  for (var i = 0; i < triplet_count; i++) {
    var byte = Math.round(Math.random() * byte_range) + min_byte;
    hexline += byte < HEX_BASE ? "x0" : "x";
    hexline += byte.toString(HEX_BASE).toUpperCase();
  }
  return hexline;
}
