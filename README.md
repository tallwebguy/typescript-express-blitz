# typescript-express-blitz
sample typescript and express application - using the blitz module loader

## Installation
- Install Visual Studio Code (optional, but makes life easier) from https://code.visualstudio.com/
- Clone repo
- `npm install` to fetch express, bluebird (promise library), swig (HTML templating library)

## Running
Can either run in the debugger, or by using `npm run-script run` to compile (commands are in the package.json file)

Code will build into a /build directory and Node will be invoked in there.

Doing `DEBUG=true node build/app.js` will show the debug output from the class loader when the application starts.

Hit http://localhost:3000/ to see it running.

## Tested on
- MacOS Sierra, Node 4.2.6
- Windows 10, Node 4.6.0 
