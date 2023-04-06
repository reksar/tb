/*
 * Generates hexline of {bytecount} "xHH" triplets representing a random byte
 * in the range {min_byte} .. {max_byte} and writes it to the {txtfile}:
 *
 *   cscript random-hexline-txt.js {bytecount} {min_byte} {max_byte} {txtfile}
 *
 *   cscript random-hexline-txt.js 3333 0 255 hexline.txt
 *
 * Splits the generated hexline into hexlines so that each line does not exceed
 * the line length limit for cmd.
 *
 * NOTE: cmd line length limit is 8191 or 8191 / 3 = 2730 "xHH" triplets. There
 * is hexline `LENGTH_LIMIT` of 2000 "xHH" triplets or 2000 * 3 = 6000 chars.
 * The remaining 8191 - 6000 = 2191 chars will be free for other cmd parts.
 * See https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
 */

// See https://learn.microsoft.com/en-us/previous-versions/d5fk67ky(v=vs.85)#remarks
WindowStyle = {Hide: 0 /*...*/};

HEX_BASE = 16;
MAX_BYTE = 255;
LENGTH_LIMIT = 2000;


bytecount = parseInt(WScript.Arguments(0));
min_byte = parseInt(WScript.Arguments(1));
max_byte = parseInt(WScript.Arguments(2));
txtfile = WScript.Arguments(3);

if (bytecount <= 0)
  throw new Error("Invalid bytecount!");
if (min_byte < 0 || MAX_BYTE < min_byte)
  throw new Error("Invalid min_byte!");
if (max_byte < min_byte || MAX_BYTE < max_byte)
  throw new Error("Invalid max_byte!");

byte_range = max_byte - min_byte;


function SplitByLimit(length)
{
  counts = [];

  repeats = Math.floor(length / LENGTH_LIMIT);
  for (i = 0; i < repeats; i++) counts.push(LENGTH_LIMIT);

  tail = length % LENGTH_LIMIT;
  if (tail) counts.push(tail);

  return counts;
}


function RandomHexline(length)
{
  hexline = "";

  for (i = 0; i < length; i++)
  {
    byte = Math.round(Math.random() * byte_range) + min_byte;
    hexline += byte < HEX_BASE ? "x0" : "x";
    hexline += byte.toString(HEX_BASE).toUpperCase();
  }

  return hexline;
}


fs = new ActiveXObject("Scripting.FileSystemObject");
file = fs.CreateTextFile(txtfile, /*rewrite*/true);
lengths = SplitByLimit(bytecount);
for (i in lengths) file.WriteLine(RandomHexline(lengths[i]));
file.Close();
