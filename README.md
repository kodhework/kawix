![logo](./icons/icon-text.png)


The next generation Javascript runtime written in and for nodejs.
This purpose is give the benefits of an advanced loader, will al the features of current node.js + npm


* [@kawix/core](./core) The main module. Runtime with latest Javascript features, TypeScript and more
* [@kawix/dhs](./dhs) A HTTP/S server with dynamic code execution, hot reloading and much more features
* [@kawix/sites/x](./sites/x) Webserver based on dhs for the https://kwx.kodhe.com/x/ service
* [@kawix/gix](./gix) A standard library for interact with an Electron instance for GUI
* [@kawix/kivi](./kivi) A basic template based on HTMLs
* [@kawix/std](./std) A standard library with some basic utilities and sublibraries



## Install runtime

@kawix/core is available for Windows,Mac,GNU/Linux. Go to [INSTALL.md](./core/INSTALL.md) for instructions


## Simple example

Run this with kwcore

```typescript
// serv-example.ts
import Server from 'https://kwx.kodhe.com/x/v/0.8.2/std/http/server'

main()
async function main(){
    const s = new Server()
    s.listen(8081)
    console.log("http://localhost:8081/")
    while(true){
        const env = await s.accept()
        env.reply.send("Hello world!")
    }
}
```


```bash
kwcore serv-example.ts
```
