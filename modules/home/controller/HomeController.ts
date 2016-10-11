//only need to import express here for types..
import * as express from "express";

/*
Every controller and model class which Blitz loads
has the same signature for the constructor - it just takes a single instance 
of the Express application
*/
export class HomeController {

    //Normally you wouldn't keep state in the controller,
    //But since this is a trivial example
    _requestCounter:number = 0;

    //Constructor is called when controllers are instanciated in Blitz
    constructor(app:express.Express) {
        this._requestCounter = 1;
    }

    //This method is called from ../index.ts where it's wired up to app.get("/")
    home(req:express.Request, res:express.Response) {
        //render out the swig template file, passing in requestCounter so it can be shown
        res.render("home/view/homepage.swig", { requestCounter : this._requestCounter++ });
    }

}