# @kawix/sites/x

This is the webserver based on dhs for the https://kwx.kodhe.com/x/ service.

This service allows people to create pretty URLs which redirect to github (or other content)

See this examples:

* [https://kwx.kodhe.com/x/std/http/server](https://kwx.kodhe.com/x/std/http/server)
* [https://kwx.kodhe.com/x/dhs/src/service](https://kwx.kodhe.com/x/dhs/src/service)


### Features

* You can specify version. For example ```https://kwx.kodhe.com/x/std/http/server``` is the same ```https://kwx.kodhe.com/x/v/master/std/http/server.js``` when master is the version

* Based on *dhs*. You don't need restart the webserver in almost any case. Changes to *registry.cson* or source code are propagated automatically

* You can make the webserver autodiscover the extension


### Starting the webserver locally


```bash
git clone https://github.com/kodhework/kawix
# main folder on this github repo
cd kawix
# or ./dhs/start.clustered.js
kwcore ./dhs/start.js
```

Now you can go to browser and put for example:

* http://YOURIP:43106/x/std/http/server
* http://YOURIP:43106/x/dhs/src/service
