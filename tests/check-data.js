FS = new ActiveXObject("Scripting.FileSystemObject");
TEST_DIR = FS.GetParentFolderName(WScript.ScriptFullName);
DATA_DIR = FS.BuildPath(TEST_DIR, "data");


WScript.Echo("Checking test data ...");

var test_names = FilterArray(MapArray(Files(TEST_DIR), MatchTestName));

for (var i in test_names) {
  try {
    WScript.Echo(Report(Check(test_names[i])));
  } catch (err) {
    WScript.Echo(Report(err));
  }
}


function Files(dir) {

  // One does not simply walk through this shit.
  var shit = FS.GetFolder(dir).Files;

  var files = [];
  for (var i = new Enumerator(shit); !i.atEnd(); i.moveNext())
    files.push(i.item());
  return files;
}


function MatchTestName(file) {

  // Test writer name is "write-<test name>.bat".
  TEST_WRITER = new RegExp("write-(.*)\.bat", "i");

  // The `match` for `TEST_WRITER` is the array [<writer name>, <test name>].
  // This is the index of the <test name>.
  TEST_NAME_PART = 1;

  var match = file.Name.match(TEST_WRITER);
  return match && match[TEST_NAME_PART];
}


function Check(test_name) {
  var pipeline = [
    DataFiles,
    MissingFiles,
    ElapsedTime,
    HexIterators,
    HexDiff,
    LengthDiff
  ];
  var data = {
    name: test_name,
    ready_to_report: false
  };
  return ReduceArray(pipeline, PassData, data);
}


/*
 * Extends `data` with the result of the `callback`. Then passes the `result`
 * further or interrupts the pipeline when `result` is `ready_to_report`.
 */
function PassData(data, callback) {
  var result = ExtendData(data, callback(data));
  if (result.ready_to_report)
    throw result;
  return result;
}


function DataFiles(data) {
  return {
    bin_file: FS.BuildPath(DATA_DIR, data.name + ".bin"),
    log_file: FS.BuildPath(DATA_DIR, data.name + ".log")
  };
}


function MissingFiles(data) {
  var files = [
    data.log_file,
    data.bin_file
  ];
  var missing_files = FilterArray(files, IsFileMissing);
  var missing_names = MapArray(missing_files, FileName);
  return {
    missing_files: missing_names,
    ready_to_report: missing_names.length
  };
}


function ElapsedTime(data) {

  TIME_MS = new RegExp(/^\d+ ms\s*$/);

  var log = new LineIterator(data.log_file);

  while (!log.Empty())
    if (time = log.Next().match(TIME_MS))
      return {elapsed_time: time[0]};

  return {elapsed_time: "? ms"};
}


function HexIterators(data) {
  return {
    actual: new CountIterator(new BinHexIterator(data.bin_file)),
    expected: new CountIterator(new TxtHexIterator(data.log_file))
  };
}


function HexDiff(data) {
  while (!(data.actual.Empty() || data.expected.Empty())) {
    var actual = data.actual.Next();
    var expected = data.expected.Next();
    if (actual !== expected)
      return {
        hex_diff: {
          index: data.actual.Count(),
          actual: actual,
          expected: expected
        },
        ready_to_report: true
    };
  }
}


function LengthDiff(data) {
  while (data.actual.Next());
  while (data.expected.Next());
  var diff = data.actual.Count() - data.expected.Count();
  return {
    length_diff: diff,
    ready_to_report: diff
  };
}


function Report(data) {

  function MissingFiles() {
    return data.missing_files.length &&
      Skip("missing files: " + data.missing_files.join(", "));
  }

  function HexDiff() {
    if (data.hex_diff)
      with (data.hex_diff)
        return Err(index+"th byte 0"+actual+" must be 0"+expected);
  }

  function LengthDiff() {

    if (data.length_diff < 0)
      return Err("missing tail of " + Math.abs(data.length_diff) + " bytes");

    if (0 < data.length_diff)
      return Err("tail of " + data.length_diff + " extra bytes");
  }

  function Skip(message) {
    return Prefix("[SKIP]") + " - " + message;
  }

  function Err(message) {
    return Prefix("[ERR]") + " - " + message + " - " + data.elapsed_time;
  }

  function Ok() {
    return Prefix("[OK]") + " - " + data.elapsed_time;
  }

  function Prefix(status) {
    return status + " " + data.name;
  }

  if (data.ready_to_report === undefined)
    throw data;

  return MissingFiles() || HexDiff() || LengthDiff() || Ok();
}


/*
 * Merge shallow copies of objects.
 */
function ExtendData(origin, extra) {
  var result = {};
  for (var i in origin) result[i] = origin[i];
  for (var i in extra) result[i] = extra[i];
  return result;
}


function LineIterator(file) {

  var txt = FS.OpenTextFile(file);

  this.Empty = function() {
    return txt.AtEndOfStream;
  }

  this.Next = function() {
    if (!this.Empty())
      return txt.ReadLine();
  }
}


function BinHexIterator(file) {

  // We are working in ASCII mode.
  CHAR_SIZE = 1;

  var txt = FS.OpenTextFile(file);

  this.Empty = function() {
    return txt.AtEndOfStream;
  }

  this.Next = function() {
    if (!this.Empty())
      return xHH(DecodeChar(txt.Read(CHAR_SIZE)));
  }
}


function TxtHexIterator(file) {

  xHH_RE = new RegExp(/^x[0-9A-F]{2}$/);
  xHH_LENGTH = 3;

  var lines = new LineIterator(file);
  var line = lines.Next();
  var i = 0;
  var xHH = ReadNext();

  this.Empty = function() {
    return !xHH;
  }

  this.Next = function() {
    if (!this.Empty()) {
      var current = xHH;
      xHH = ReadNext();
      return current;
    }
  }

  function ReadNext() {

    if (line.length <= i) {
      line = lines.Next();
      i = 0;
    }

    var match = line.substring(i, i += xHH_LENGTH).match(xHH_RE);
    return match && match[0];
  }
}


/*
 * Wrapper for `iterable` to `count` iterations passed.
 */
function CountIterator(iterable) {

  var count = 0;

  this.Count = function() {
    return count;
  }

  this.Empty = iterable.Empty;

  this.Next = function() {
    if (!this.Empty())
      return ++count && iterable.Next();
  }
}


/*
 * The `charCodeAt` returns an UTF-16 value greater than 255 for most chars
 * from `line[char_idx]`, when a char is in the ANSI range. In this case, this
 * function will convert the UTF-16 value to the range [128 .. 255].
 */
function DecodeChar(char) {

  MAX_BYTE = 255;

  // An integer between 0 and 65535 representing the UTF-16 code unit.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  var code = char.charCodeAt(0);

  if (code <= MAX_BYTE) return code;

  // Below is an empirical rules for converting UTF-16 to a byte value in the
  // range [128 .. 255], when a `code > MAX_BYTE`.

  if (1040 <= code && code <= 1103) return code - 848;

  switch (code) {
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

  throw new Error("Char decoding error!");
}


/*
 * Converts `int_byte` [0 .. 255] to the string ["x00" .. "xFF"].
 */
function xHH(int_byte) {
  HEX_BASE = 16;
  var hex_byte = int_byte.toString(HEX_BASE).toUpperCase();
  return (hex_byte.length == 1 ? "x0" : "x") + hex_byte;
}


function FilterArray(array, callback) {
  var match = callback || Value;
  var result = [];
  for (var i in array)
    if (match(array[i]))
      result.push(array[i]);
  return result;
}


function MapArray(array, callback) {
  var result = [];
  for (var i in array)
    result.push(callback(array[i]));
  return result;
}


function ReduceArray(array, callback, initial) {
  var i = 0;
  var result = initial !== undefined ? initial : array[i++];
  while (i < array.length)
    result = callback(result, array[i++]);
  return result;
}


function IsFileMissing(file) {return !FS.FileExists(file)}
function FileName(file) {return FS.GetFileName(file)}
function Value(x) {return x}
