# tb

Translates {hexline} to bytes and *appends* them to {outfile}:

```batch
tb {hexline} {outfile}

tb x00x46x6Fx6FxFF "file.bin"

tests\test
```

## The problem

Described on [stackoverflow](https://stackoverflow.com/questions/47750732/write-hex-values-to-file-in-windows-batch)

### Restrictions

These may not be available on some Windows configurations:
* `forfiles`
* `certutil`
* `powershell`
* ActiveX ADO - "ADODB"

[JREPL](https://www.dostips.com/forum/viewtopic.php?f=3&t=6044) uses "ADODB"
under the cut.
