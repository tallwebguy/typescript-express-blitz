//only need to import express here for types..
import * as express from "express";

import { PageCounterModel } from "../model/PageCounterModel";

/*
Every controller and model class which Blitz loads
has the same signature for the constructor - it just takes a single instance 
of the Express application
*/
export class HomeController {

    //reference to the PageCounterModel for tracking page hits..
    private _pageCounterModel:PageCounterModel;

    //Constructor is called when controllers are instanciated in Blitz
    constructor(app:express.Express) {
        this._pageCounterModel = app.get("models").PageCounterModel; //this does an implicit cast to <PageCounterModel>
    }

    //This method is called from ../index.ts where it's wired up to app.get("/")
    home(req:express.Request, res:express.Response) {
        //render out the swig template file, passing in requestCounter so it can be shown
        this._pageCounterModel.registerHit();
        res.render("home/view/homepage.swig", { requestCounter : this._pageCounterModel.getHitCount() });
    }

}