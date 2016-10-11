///<reference path="typings/index.d.ts"/>

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import * as express from "express";
import * as Promise from "bluebird";

/*
Used for indicating which modules need loading
*/
export interface ILoadableItem {
	name:string;
	path:string;
	loaded:boolean;
}
export interface ILoadableModule extends ILoadableItem {
	index:Function;
}


/*
This is a rework of the G2G/Echo Blitz class loader. It works with the convention of modules/<name>/controllers||models||index.js
file to create singletons of all of the controller and model files within the project.
Everything is added into the Express instance which is passed into configure
*/
export class Blitz {

	private _localDir:string = undefined;
	private _modulePath:string = undefined;
	private _modulesDirectory:string = "modules";
	private _moduleIndexFile:string = "index.js";
	private _readDir = Promise.promisify(fs.readdir);
	private _stat = Promise.promisify(fs.stat);

	/*
	You can pass in a different directory if you don't want it to start searching with __dirname
	*/
	constructor(dir?:string) {
		this._localDir = dir || __dirname;
		this._modulePath = path.join(this._localDir, this._modulesDirectory);
	}

	public configure(app:express.Express):Promise<any> {
		return this.loadModels(app)
			.then(() => {
				return this.loadControllers(app)
					.then(() => {
						return this.loadModules(app)
					})
			})
	}

	//loop through the modules/controller directory and create instances
	//of controllers and add them in to the application passed in..
	public loadControllers(app:express.Express):Promise<any> {
		return this.loadItems(app, "controllers", "controller"); //this should return a promise..
	}
	private loadModels(app:express.Express):Promise<any> {
		return this.loadItems(app, "models", "model");
	}

	/*
	Returns a Promise<string[]> of directories listed within a given path 
	*/
	public filterPathForDirectories(directoryPaths:Promise<string[]>):Promise<string[]> {
		let filteredPaths:string[] = [];
		return Promise.all(directoryPaths)
			.map((p:string) => {
				this.isDir(p)
					.then((val:boolean) => {
						if (val) { filteredPaths.push(p); }
					});
			})
			.then((values) => {
				return filteredPaths;
			});
	}

	/*
	Returns a Promise<boolean> if the given path is a directory
	*/
	private isDir(path:string):Promise<boolean> {
		return this._stat(path)
			.then((pathStat:fs.Stats) => {
				return pathStat.isDirectory();
			})
			.catch((error) => {
				return false;
			})
	}

	/*
	This is the real workhorse of the class - it'll go look inside the modules directory for modules,
	then it'll go look for controllers or models (or whatever), depending on dirName. It'll load anything in
	which looks loadable, and stash it all away in app.set(typeName).
	Will return Promise<ILoadableItem[]> as a list of things it has loaded in.
	*/
	private loadItems(app:express.Express, typeName:string, dirName:string):Promise<any> { 
		let loadPaths = {}; //we're going to make a hash of the things to load in
		//see if we have anything cached in the app here for this type
		let items = app.get(typeName);
		if (items == undefined) { items = {}; app.set(typeName, items); }
		return this._readDir(this._modulePath)
			.map((mod:string) => { //turn the list of modules into a list of full paths
				return path.join(this._modulePath, mod);
			})
			//look inside the module to see if it has something we want to load..
			.map((mod:string) => {
				let typeDirectory = path.join(mod, dirName);
				return this.isDir(typeDirectory)
					.then((val:boolean) => { if (val) return typeDirectory })
			})
			.then((mod) => {
				let flattenedArray = [].concat.apply([], mod);
				flattenedArray = flattenedArray.filter((v) => { return v; }) //remove anything undefined..
				return flattenedArray;
			})
			//at this point we now have a list of module/<name>/<type> directories which we want to look inside
			.map((mod:string) => {
				return this._readDir(mod) //this gives us a list of the things inside module/<name>/<type>
					.map((itemObject:string) => {
						let itemPath = path.join(mod, itemObject);
						let splitName = itemObject.split(".");
						let itemName = splitName[0]; //turns MyObject.ts into MyObject
						return this._stat(itemPath)
							.then((itemStat) => {
								if (!itemStat.isDirectory() && items[itemName] == undefined && itemName.length > 0 && splitName.pop() == "js" ) {
									//then this is something we should load
									return <ILoadableItem>{name : itemName, path : itemPath, loaded : false };
								}
							})
					});
			})
			.then((mod) => {
				let flattenedArray = [].concat.apply([], mod);
				flattenedArray = flattenedArray.filter((v) => { return v; }) //remove anything undefined..
				return flattenedArray;
			})
			//Here we should now have a list of the names of things and the paths to load them from..
			.map((loadableItem:ILoadableItem) => {
				let newObj = require(loadableItem.path);
				let newInstance = new newObj[loadableItem.name](app); //TS does this extra wrapper around the required object
				items[loadableItem.name] = newInstance;
				loadableItem.loaded = true;
				return loadableItem;
			})
			.then((loadedItems:ILoadableItem[]) => {
				return loadedItems
			})
	}

	public loadModules(app:express.Express):Promise<any> {
		/*
		- list of folders in modules directory
		- look for index.js file within those folders
		- require() and execute file
		*/
		let indexFiles:any = []
		return this._readDir(this._modulePath)
			.map((mod) => { //this is a module inside the /modules directory
				let indexPath = path.join(this._modulePath, mod, this._moduleIndexFile);
				return this._stat(indexPath)
					.then((modStat):ILoadableModule => {
						if (modStat.isFile()) { return <ILoadableModule>{ path : indexPath, name : mod, loaded : false }; }
					})
					.catch((error) => {}) //no index file. I'm ok with that.
			})
			.then((indexFiles:ILoadableModule[]):ILoadableModule[] => {
				indexFiles = indexFiles.filter((v) => { return v != undefined });
				return indexFiles;
			})
			//include and execute the index file
			.map((indexFile:ILoadableModule):ILoadableModule => {
				indexFile.index = require(indexFile.path);
				indexFile.index(app);
				indexFile.loaded = true;
				return indexFile;
			})

	}
	
}

