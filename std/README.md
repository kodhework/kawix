# @kawix/std
## Standard library accessible from web for @kawix/core

@kawix/std is a collection of modules, accessibles from URL imports using @kawix/core
It is in a premature stage. You can start testing: 


```bash
mkdir @kawix
cd @kawix
git clone https://github.com/voxsoftware/kawix-core core
git clone https://github.com/voxsoftware/kawix-std std
cd core 


# using --force to allow always download last changes before executing 
# don't use --force on production

# this is a basic replication of tar command
./bin/kwcore --force  "https://raw.githubusercontent.com/voxsoftware/kawix-std/master/compression/example/bin/basic-tar.js" --help
```