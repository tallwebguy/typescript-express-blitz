/// <reference path="typings/index.d.ts" />

import * as path from "path";

//import express & swig application in
import * as express from "express";
import * as swig from "swig";

import { Blitz } from "./Blitz";

//create express instance (returns express.Express type)
let app:express.Express = express();

//set up swig
app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');
app.set('views', path.join(__dirname, "..", "modules")); //views are *not* served from the build directory..
app.set('view cache', false);
swig.setDefaults({ cache : false });

/*
Invoke the Blitz class loader, this will walk the modules directory
and look for suitable Controllers and Models to load in
*/
let b:Blitz = new Blitz();
if (process.env['DEBUG']) {
	b.on("LOG", (msg) => { console.log(msg) });
}
//configure returns a promise which will resolve when everything has finished loading
b.configure(app).then(() => {
	//Application starts up in the same way
	app.listen(3000, () => {
		console.log("Server Running!");
	})
});

