/*
 * Tests `tb` on a generated random hexline which is longer than the cmd length
 * limit.
 *
 * NOTE: Generating a long hexline on the fly with `random-hexline.bat` is too
 * slow (~ 55 byte / s), therefore this MS JScript is used instead of pure
 * batch.
 *
 * FIXME: Writing with `tb` using "WScript.Shell" is more than 10 times slower
 * than a pure batch (67 byte / s against 5 byte / s)!
 */

// See https://learn.microsoft.com/en-us/previous-versions/d5fk67ky(v=vs.85)#remarks
WindowStyle = {Hide: 0 /*...*/};

HEX_BASE = 16;
MAX_BYTE = 255;


bytecount = parseInt(WScript.Arguments(0));
min_byte = parseInt(WScript.Arguments(1));
max_byte = parseInt(WScript.Arguments(2));
outfile = WScript.Arguments(3);
logfile = WScript.Arguments(4);

if (bytecount <= 0) throw new Error("Invalid bytecount!");
if (min_byte < 0 || MAX_BYTE < min_byte) throw new Error("Invalid min_byte!");
if (max_byte < 0 || MAX_BYTE < max_byte) throw new Error("Invalid max_byte!");
if (max_byte < min_byte) throw new Error("max_byte < min_byte!");


range = max_byte - min_byte;

shell = new ActiveXObject("WScript.Shell");
fs = new ActiveXObject("Scripting.FileSystemObject");
log = fs.CreateTextFile(logfile, /*rewrite*/true);

for (i = 0; i < bytecount; i++)
{
  byte = Math.round(Math.random() * range) + min_byte;
  xHH = (byte < HEX_BASE ? "x0" : "x") + byte.toString(HEX_BASE).toUpperCase();

  tb = "cmd /c tb "+xHH+" \""+outfile+"\"";
  shell.Run(tb, WindowStyle.Hide, /*WaitOnReturn*/true);

  log.Write(xHH);
}

log.Write("\n");
log.Close();
