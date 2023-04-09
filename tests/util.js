(function() {

HEX_BASE = 16;
MAX_BYTE = 255;

// Line length limit for cmd is 8191 or 8191 / 3 = 2730 "xHH" triplets.
// `MAX_TRIPLETS_PER_LINE` is set to 2001 "xHH" triplets or 2001 * 3 = 6003
// chars per line (excluding CRLF). The remaining 8191 - 6003 = 2188 chars will
// be available for the remaining cmd.
//
// See https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/command-line-string-limitation
MAX_TRIPLETS_PER_LINE = 2001;

TRIPLET_LENGTH = 3;

var max_hexline_length = MAX_TRIPLETS_PER_LINE * TRIPLET_LENGTH;


function HexLineGenerator(byte_iterator) {

  var triplets = new HexTripletGenerator(byte_iterator);

  this.Empty = triplets.Empty;

  this.Next = function() {

    var hexline = "";

    while (!triplets.Empty() && hexline.length < max_hexline_length)
      hexline += triplets.Next();

    return hexline;
  }
}


function HexTripletGenerator(byte_iterator) {

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
  HexTripletGenerator: HexTripletGenerator,
  HexLineGenerator: HexLineGenerator
};

}).call();
