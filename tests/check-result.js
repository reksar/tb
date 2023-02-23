RESULT_DIR_NAME = "result";
TEST_NAMES = [
  "all-sorted",
  "random-ascii",
  "random-ansi",
  "random-any",
  "random-unprintable"
];
BIN_EXT = ".bin";
LOG_EXT = ".log";
SPACE = " ";

// At least one hexbyte "xHH", where `H` is a hex digit.
HEXLINE_RE = new RegExp(/^(x[0-9A-F]{2})+$/);
// The length of the "xHH" triplet.
HEXBYTE_LENGTH = 3;

HEX_BASE = 16;
MAX_BYTE = 255;


// Prefer this than "ADODB" (see README).
FS = new ActiveXObject("Scripting.FileSystemObject");

testDir = FS.GetParentFolderName(WScript.ScriptFullName);
resultDir = FS.BuildPath(testDir, RESULT_DIR_NAME);

if (!FS.FolderExists(resultDir)) throw new Error("No results to check!");


/*
 * The `charCodeAt` returns an UTF-16 value greater than 255 for most chars
 * from `line[charIdx]`, when a char is in the ANSI range. In this case, this
 * function will convert the UTF-16 value to the range [128 .. 255].
 */
function byteFromChar(line, charIdx)
{
  // An integer between 0 and 65535 representing the UTF-16 code unit.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  code = line.charCodeAt(charIdx);

  if (code <= MAX_BYTE) return code;

  // Below is an empirical rules for converting UTF-16 to a byte value in the
  // range [128 .. 255], when a `code > MAX_BYTE`.

  if (1040 <= code && code <= 1103) return code - 848;

  switch (code)
  {
		case 1026: return 128;
		case 1027: return 129;
		case 8218: return 130;
		case 1107: return 131;
		case 8222: return 132;
		case 8230: return 133;
		case 8224: return 134;
		case 8225: return 135;
		case 8364: return 136;
		case 8240: return 137;
		case 1033: return 138;
		case 8249: return 139;
		case 1034: return 140;
		case 1036: return 141;
		case 1035: return 142;
		case 1039: return 143;
		case 1106: return 144;
		case 8216: return 145;
		case 8217: return 146;
		case 8220: return 147;
		case 8221: return 148;
		case 8226: return 149;
		case 8211: return 150;
		case 8212: return 151;
		case 8482: return 153;
		case 1113: return 154;
		case 8250: return 155;
		case 1114: return 156;
		case 1116: return 157;
		case 1115: return 158;
		case 1119: return 159;
		case 1038: return 161;
		case 1118: return 162;
		case 1032: return 163;
		case 1168: return 165;
		case 1025: return 168;
		case 1028: return 170;
		case 1031: return 175;
		case 1030: return 178;
		case 1110: return 179;
		case 1169: return 180;
		case 1105: return 184;
		case 8470: return 185;
		case 1108: return 186;
		case 1112: return 188;
		case 1029: return 189;
		case 1109: return 190;
		case 1111: return 191;
  }

  throw new Error("Invalid char code!");
}


function lastChar(line)
{
  return line.substring(line.length - 1, line.length);
}


function withoutLastChar(line)
{
  return line.substring(0, line.length - 1);
}


function trimSuffix(line)
{
  while (lastChar(line) == SPACE) line = withoutLastChar(line);
  return line;
}


function hexTriplet(byteValue)
{
  hexByte = byteValue.toString(HEX_BASE).toUpperCase();
  prefix = hexByte.length == 1 ? "x0" : "x";
  return prefix + hexByte;
}


function testHexline(file)
{
  bytecount = FS.GetFile(file).Size;

  bin = FS.OpenTextFile(file);
  line = bin.Read(bytecount);
  bin.Close();

  hexline = "";
  for (i = 0; i < bytecount; i++) hexline += hexTriplet(byteFromChar(line, i));
  if (!hexline.match(HEXLINE_RE)) throw new Error("Invalid hexline!");
  return hexline;
}


function parseLog(file)
{
  log = FS.OpenTextFile(file);
  hexline = trimSuffix(log.ReadLine());
  elapsed_time = trimSuffix(log.ReadLine());
  log.Close();

  if (!hexline.match(HEXLINE_RE)) throw new Error("Invalid hexline log!");

  return {
    hexline: hexline,
    elapsed_time: elapsed_time
  };
}


for (i in TEST_NAMES)
{
  name = TEST_NAMES[i];
  binFile = FS.BuildPath(resultDir, name + BIN_EXT);
  logFile = FS.BuildPath(resultDir, name + LOG_EXT);

  if (FS.FileExists(binFile) && FS.FileExists(logFile))
  {
    log = parseLog(logFile);

    if (testHexline(binFile) == log.hexline)
      WScript.Echo("[OK]", name, "("+log.elapsed_time+")");
    else
      WScript.Echo("[ERR]", name, "("+log.elapsed_time+")");
  }
  else WScript.Echo("[SKIP]", name, "- no test files!");
}
