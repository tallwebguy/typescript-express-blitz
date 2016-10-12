import * as express from "express"

/*
Super simple thing to demonstrate how state can be abstracted
from controllers into the model. In turn this should really be backed
by something authoritivate - a database, redis, memcache
*/
export class PageCounterModel {

    private _hitCounter = 0

    constructor(app:express.Express) {}

    registerHit() { this._hitCounter++ }
    getHitCount() { return this._hitCounter }

}