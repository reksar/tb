# tb

Translates `[hexline]` (a line of `["x00" .. "xFF"]` triplets) to bytes
and *appends* them to `[outfile]`.

```batch
tb [hexline] [outfile]

tb x00x46x6Fx6FxFF "outfile.bin"
```

### Tests

Unlike `tb`, the tests use `JScript`.

Run with `tests\test`. Add the `-c` key to only check the test data, without
writing.

Produces test data with `tests\write-<test-name>.bat` *writers*. Each *writer*
produces two files: `tests\data\<test-name>.bin` and
`tests\data\<test-name>.log`.

The `tests\check-data.js` is used to check all the produced test data.

### The problem

Described on [stackoverflow](https://stackoverflow.com/questions/47750732/write-hex-values-to-file-in-windows-batch)

But all the solutions presented there have some **restrictions**.

These may not be available on some Windows configurations:
* `forfiles`
* `certutil`
* `powershell`
* `cscript`
* ActiveX ADO - "ADODB"

[JREPL](https://www.dostips.com/forum/viewtopic.php?f=3&t=6044) uses "ADODB"
under the hood.

This solution is devoid of these problems, but the write speed ~ 70 byte/s.
