(function() {

HEX_BASE = 16;
MAX_BYTE = 255;


/*
 * Translates each byte [0 .. 255] from `byte_iterator` into "xHH" hex triplet
 * and joins these triplets into a hexline.
 *
 * More than one hexline will be generated if the `MAX_LENGTH` limit is
 * exceeded.
 */
function HexlineGenerator(byte_iterator) {

  // Length limit for a cmd line is 8191.
  // See https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
  //
  // `MAX_LENGTH` is set to 6000 chars (excluding CRLF), i.e. 6000 / 3 = 2000
  // "xHH" triplets. The remaining 8191 - 6000 = 2191 chars will be free for
  // the remaining cmd.
  MAX_LENGTH = 6000;

  var triplets = new xHHGenerator(byte_iterator);

  this.Empty = triplets.Empty;

  this.Next = function() {

    var hexline = "";

    while (!this.Empty() && hexline.length < MAX_LENGTH)
      hexline += triplets.Next();

    return hexline;
  }
}


function xHHGenerator(byte_iterator) {

  this.Empty = byte_iterator.Empty;

  this.Next = function() {

    if (!this.Empty()) {

      var byte = byte_iterator.Next();

      if (byte < 0 || MAX_BYTE < byte)
        throw new Error("Invalid byte value!");

      return (byte < HEX_BASE ? "x0" : "x") +
        byte.toString(HEX_BASE).toUpperCase();
    }
  }
}


return {
  xHHGenerator: xHHGenerator,
  HexlineGenerator: HexlineGenerator
};

}).call();
