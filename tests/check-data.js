DATA_DIR_NAME = "data";
BIN_EXT = ".bin";
LOG_EXT = ".log";
BAT_EXT = ".bat"
SPACE = " ";

// Writer file name is "write-*.bat".
WRITER_PREFIX = "write-";
// Match will be an array of two items: 0 - full name, 1 - test name.
WRITER_RE = new RegExp(/write-(.*)\.bat/);

// At least one hexbyte "xHH", where `H` is a hex digit.
HEXLINE_RE = new RegExp(/^(x[0-9A-F]{2})+$/);
// The length of the "xHH" triplet.
xHH_LENGTH = 3;
// The length of the "HH" hex value.
HH_LENGTH = 2;

HEX_BASE = 16;
MAX_BYTE = 255;


// Prefer this than "ADODB" (see README). But it is limited to text mode.
fs = new ActiveXObject("Scripting.FileSystemObject");

test_dir = fs.GetParentFolderName(WScript.ScriptFullName);
data_dir = fs.BuildPath(test_dir, DATA_DIR_NAME);

if (!fs.FolderExists(data_dir)) throw new Error("No results to check!");


/*
 * The `charCodeAt` returns an UTF-16 value greater than 255 for most chars
 * from `line[char_idx]`, when a char is in the ANSI range. In this case, this
 * function will convert the UTF-16 value to the range [128 .. 255].
 */
function ByteFromChar(line, char_idx)
{
  // An integer between 0 and 65535 representing the UTF-16 code unit.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  code = line.charCodeAt(char_idx);

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


function LastChar(line)
{
  return line.substring(line.length - 1, line.length);
}


function WithoutLastChar(line)
{
  return line.substring(0, line.length - 1);
}


function TrimSuffix(line)
{
  while (LastChar(line) == SPACE) line = WithoutLastChar(line);
  return line;
}


function ReadLine(file)
{
  return TrimSuffix(file.ReadLine());
}


function HexTriplet(byte_value)
{
  hex_byte = byte_value.toString(HEX_BASE).toUpperCase();

  if (1 <= hex_byte.length && hex_byte.length <= HH_LENGTH)
    return (hex_byte.length == HH_LENGTH ? "x" : "x0") + hex_byte;

  throw new Error("Unable to convert byte int value to hex!");
}


function TestHexline(file)
{
  bytecount = fs.GetFile(file).Size;

  bin = fs.OpenTextFile(file);
  line = bin.Read(bytecount);
  bin.Close();

  hexline = "";
  for (i = 0; i < bytecount; i++) hexline += HexTriplet(ByteFromChar(line, i));
  if (!hexline.match(HEXLINE_RE)) throw new Error("Invalid hexline!");
  return hexline;
}


function ParseLog(file)
{
  log = fs.OpenTextFile(file);

  hexline = ReadLine(log);

  try {
    elapsed_time = ReadLine(log);
  } catch (err) {
    elapsed_time = "? ms";
  }

  log.Close();

  if (!hexline.match(HEXLINE_RE)) throw new Error("Invalid hexline log!");

  return {
    hexline: hexline,
    elapsed_time: elapsed_time
  };
}


function DiffMessage(actual_hexline, expected_hexline)
{
  if (!actual_hexline.match(HEXLINE_RE))
    throw new Error("Invalid actual hexline!");

  if (!expected_hexline.match(HEXLINE_RE))
    throw new Error("Invalid expected hexline!");

  min_length = Math.min(actual_hexline.length, expected_hexline.length);

  for (var i = 0; i < min_length; i += xHH_LENGTH)
  {
    actual = actual_hexline.substring(i, i + xHH_LENGTH);
    expected = expected_hexline.substring(i, i + xHH_LENGTH);

    if (actual != expected)
    {
      byte_idx = Math.round(i / xHH_LENGTH);
      return "- "+byte_idx+"th byte 0"+actual+" must be 0"+expected;
    }
  }

  length_diff = actual_hexline.length - expected_hexline.length;
  bytecount_diff = Math.round(length_diff / xHH_LENGTH);

  if (bytecount_diff < 0)
    return "- missing tail of "+Math.abs(bytecount_diff)+" bytes";

  if (0 < bytecount_diff)
    return "- tail of "+bytecount_diff+" extra bytes";

  return "";
}


function ReadTestNames()
{
  names = [];

  files = fs.GetFolder(test_dir).Files;

  for (i = new Enumerator(files); !i.atEnd(); i.moveNext())
  {
    path = i.item();
    writer_match = fs.GetFile(path).Name.match(WRITER_RE);
    if (writer_match) names.push(writer_match[1]);
  }

  return names;
}


WScript.Echo("Checking test data");
test_names = ReadTestNames();

for (i in test_names)
{
  name = test_names[i];
  bin_file = fs.BuildPath(data_dir, name + BIN_EXT);
  log_file = fs.BuildPath(data_dir, name + LOG_EXT);

  if (fs.FileExists(bin_file) && fs.FileExists(log_file))
  {
    log = ParseLog(log_file);
    hexline = TestHexline(bin_file);
    diff = DiffMessage(hexline, log.hexline);

    if (diff)
      WScript.Echo("[ERR]", name, diff, "("+log.elapsed_time+")");
    else
      WScript.Echo("[OK]", name, "("+log.elapsed_time+")");
  }
  else WScript.Echo("[SKIP]", name, "- no test files!");
}
