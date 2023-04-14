FS = new ActiveXObject("Scripting.FileSystemObject");
TEST_DIR = FS.GetParentFolderName(WScript.ScriptFullName);
ROOT = FS.GetParentFolderName(TEST_DIR);
LIB = eval(FS.OpenTextFile(FS.BuildPath(ROOT, "lib.js")).ReadAll());
CHARCODES = Charcodes();

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
  var data_dir = FS.BuildPath(TEST_DIR, "data");
  return {
    bin_file: FS.BuildPath(data_dir, data.name + ".bin"),
    log_file: FS.BuildPath(data_dir, data.name + ".log")
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
  var actual_hex = new LIB.xHHGenerator(new ByteIterator(data.bin_file));
  var expected_hex = new xHHIterator(new LineIterator(data.log_file));
  return {
    actual: new CountIterator(actual_hex),
    expected: new CountIterator(expected_hex)
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


/*
 * Iterates over lines of a text `file`.
 */
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


/*
 * Iterates over the byte values of a `bin_file`.
 */
function ByteIterator(bin_file) {

  // To avoid using ADODB, we read `bin_file` as text and `DecodeChar`s to get
  // the actual byte values.
  var txt = FS.OpenTextFile(bin_file);

  this.Empty = function() {
    return txt.AtEndOfStream;
  }

  this.Next = function() {
    if (!this.Empty())
      return CHARCODES[txt.Read(LIB.CHAR_SIZE)];
  }
}


/*
 * Iterates over "xHH" hex triplets of all hexlines from `hexline_iterator`.
 */
function xHHIterator(hexline_iterator) {

  xHH_RE = new RegExp(/^x[0-9A-F]{2}$/);
  xHH_LENGTH = 3;

  var hexline = hexline_iterator.Next();
  var i = 0;
  var xHH = NextxHH();

  this.Empty = function() {
    return !xHH;
  }

  this.Next = function() {
    if (!this.Empty()) {
      var current = xHH;
      xHH = NextxHH();
      return current;
    }
  }

  /*
   * Looks ahead to predict the emptiness of this iterator when a `hexline`
   * has not yet been fully processed, but the next content does not match
   * `xHH_RE`, i.e. no more "xHH" triplets or the chain is broken.
   */
  function NextxHH() {

    if (hexline.length <= i) {
      hexline = hexline_iterator.Next();
      i = 0;
    }

    var match = hexline.substring(i, i += xHH_LENGTH).match(xHH_RE);
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


/*
 * A `codepage` is an array of chars indexed by their codes. A `charcodes` is
 * a reversed `codepage` - a dict used to get the char code using the char as
 * a key.
 */
function Charcodes() {
  var bytes = FS.BuildPath(ROOT, "bytes");
  var codepage = LIB.CodePage(bytes);
  var charcodes = {};
  for (var code = 0; code < codepage.length; code++)
    charcodes[codepage[code]] = code;
  return charcodes;
}


function IsFileMissing(file) {return !FS.FileExists(file)}
function FileName(file) {return FS.GetFileName(file)}
function Value(x) {return x}
