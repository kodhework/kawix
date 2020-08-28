# kawix/core example programs

This module contains small scripts that demonstrate use of kawix/core and its standard
module.

You can run these examples using just their URL or install the example as an
executable script which references the URL. (Think of installing as creating a
bookmark to a program.)

### A TCP echo server

```shell
kwcore gh+/kodhework/kawix/std/examples/echo_server.ts
```

Or

```shell
# install 
kwcore --map echo_server gh+/kodhework/kawix/std/examples/echo_server.ts
```

### cat - print file to standard output

```shell
kwcore --map kawix_cat gh+/kodhework/kawix/std/examples/cat.ts
kawix_cat file.txt
```

### curl - print the contents of a url to standard output

```shell
kwcore gh+/kodhework/kawix/std/examples/curl.ts https://github.com/kodhework/kawix
```
