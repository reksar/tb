# trb

Translate bytes from hex line to file:

```batch
trb "x66x6fx6f" "file.bin"
```

## The problem

Described on [stackoverflow](https://stackoverflow.com/questions/47750732/write-hex-values-to-file-in-windows-batch)

### Restrictions

These may not be available on some Windows configurations:
* `powershell`
* `certutil`
* ActiveX ADO - "ADODB"

[JREPL](https://www.dostips.com/forum/viewtopic.php?f=3&t=6044) uses "ADODB",
so it cannot be used.

This solution depends on the components available in most configurations:
* `cscript`
* ActiveX "Scripting.FileSystemObject"
* ActiveX "WScript.Shell"
