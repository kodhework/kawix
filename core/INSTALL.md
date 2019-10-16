## Windows

Universal Installer (32bit, 64bit, autoupdated)  available for Windows. Please go to [https://github.com/kodhework/kawix/releases/tag/Universal-1](https://github.com/kodhework/kawix/releases/tag/Universal-1)


## Linux 

Only x64 is supported. Install ```curl``` if is not installed

```bash
curl  -sL https://kwx.kodhe.com/x/std/install/linux.sh | bash
```

## MacOs 

Only x64 is supported

```bash
curl  -sL https://kwx.kodhe.com/x/std/install/mac.sh | bash
```


# Install instructions

If you have installed ```@kawix/core```, you can get the latest version executing the same installer or executing this command on your terminal/cmd

```bash 
kwcore --update
``` 



## File Asociations

All installer create some file asociations, suitable for distribute executable files. This doesn't apply for OS without desktop experience

* ```.kwe``` Will be treat as ```.js``` file but will open a terminal GUI
* ```.kwo``` Will be treat as ```.js``` file but will not open a terminal GUI. Ideal for GUI apps
* ```.kwsh``` Is an special format, still not documented




