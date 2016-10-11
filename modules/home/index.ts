/*
The index file inside a module can deal with any module specific set up,
plus any routes which need to be wired up for this module to deal with.
Having the routes split up per module makes it easier for multiple people to work
on the code without generating conflicts in a single master routes file
*/

//only need to import express here for types..
import * as express from "express";

//also only need to import HomeController here for type information..
import { HomeController } from "./controller/HomeController"; 

//Export the function which Blitz will invoke
export = function (app:express.Express) {

    //Grab the home controller from the registry, wire up which methods need to be invoked
    let homeController = <HomeController>app.get("controllers").HomeController
    app.get("/", (req, res) => { homeController.home(req, res) });

}