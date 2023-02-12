MAX_INT_BYTE = 255;
MAX_ASCII = 127;
HEX_BASE = 16;
HEX_BYTE_LENGTH = 2;
HEX_BYTE_RE = new RegExp("^[0-9a-fA-F]{"+HEX_BYTE_LENGTH+"}$");
HEX_DELIMITER = "x";
HEX_DELIMITER_RE = new RegExp(HEX_DELIMITER);

// See https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/filesystemobject-object
FS = new ActiveXObject("Scripting.FileSystemObject");

// See https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/opentextfile-method
IOMode = {
  Read: 1,
  Write: 2,
  Append: 8
};
Format = {
  Default: -2,
  Unicode: -1,
  ASCII: 0
};


function isIntByte(value) {
  return 0 <= value && value <= MAX_INT_BYTE;
}


function hexByteToInt(hexValue) {

  if (!hexValue.match(HEX_BYTE_RE))
    throw new Error("Invalid hex byte value!");

  intValue = parseInt(hexValue, HEX_BASE);

  if (isNaN(intValue))
    throw new Error("Cannot convert hex byte value to integer!");

  if (!isIntByte(intValue))
    throw new Error("Byte value out of range!");

  return intValue;
}


function byteArray(hexLine) {

  unitLength = HEX_DELIMITER.length + HEX_BYTE_LENGTH;

  if (hexLine.length % unitLength)
    throw new Error("Invalid hex line length!");

  hexBytes = hexLine.split(HEX_DELIMITER_RE);
  bytesTotal = Math.round(hexLine.length / unitLength);

  if (hexBytes.length != bytesTotal)
    throw new Error("Hex line is broken!");

  intBytes = [];

  for (i in hexBytes)
    intBytes[i] = hexByteToInt(hexBytes[i]);

  return intBytes;
}


function bytesToLine(bytes) {
  line = "";
  for (i in bytes)
    line += String.fromCharCode(bytes[i]);
  return line;
}


function writeASCII(bytes, filePath) {
  file = FS.OpenTextFile(filePath, IOMode.Append, /*create*/true, Format.ASCII);
  file.Write(bytesToLine(bytes));
  file.Close();
}


function writeUnicode(bytes, filePath) {
  WScript.Echo(bytes);
}


function ASCIIWritter(intByte) {

  bytes = [];

  function addByte(intByte) {

    if (!isIntByte(intByte))
      throw new Error("Not a byte!");

    if (intByte > MAX_ASCII)
      throw new Error("Byte value is not ASCII!");

    bytes.push(intByte);
  }

  function writeBytes(filePath) {

    if (!filePath)
      throw new Error("File path not scpecified!");

    if (!bytes.length)
      throw new Error("No bytes to write!");

    writeASCII(bytes, filePath);
  }

  addByte(intByte);
  
  return {
    add: addByte,
    write: writeBytes
  };
}


function UnicodeWritter(intByte) {

  bytes = [];

  function addByte(intByte) {

    if (!isIntByte(intByte))
      throw new Error("Not a byte!");

    if (intByte <= MAX_ASCII)
      throw new Error("Byte value is ASCII!");

    bytes.push(intByte);
  }

  function writeBytes(filePath) {

    if (!filePath)
      throw new Error("File path not scpecified!");

    if (!bytes.length)
      throw new Error("No bytes to write!");

    writeUnicode(bytes, filePath);
  }

  addByte(intByte);

  return {
    add: addByte,
    write: writeBytes
  };
}


function WritterFor(intByte) {
  if (intByte <= MAX_ASCII)
    return ASCIIWritter(intByte);
  return UnicodeWritter(intByte);
}


function writeBytes(bytes, filePath) {
  writter = WritterFor(bytes[0]);
  for (i = 1; i < bytes.length; i++) {
    try {
      writter.add(bytes[i]);
    } catch (err) {
      writter.write(filePath);
      writter = WritterFor(bytes[i]);
    }
  }
  writter.write(filePath);
}


function main() {
  hexLine = WScript.Arguments(0);
  filePath = WScript.Arguments(1);
  writeBytes(byteArray(hexLine), filePath);
}


main();
