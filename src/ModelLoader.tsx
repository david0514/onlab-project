import {Model} from "./Model";
import {SceneLoader} from "@babylonjs/core";

export class ModelLoader {
    currentMaxId: number;
    configuration: any;     //promise
    private modelArray = new Array();

    constructor() {
        this.currentMaxId=0;
        this.configuration = this.getConfiguration();
        console.log(this.configuration.toString());
    }

    async getConfiguration() {
        let resultJSON = await fetch("configuration.json");
        const result = await resultJSON.json();
        return result;
    }


    loadModel(typename: string) {
        let newModel= new Model(typename, this.configuration, this.currentMaxId++);
        this.modelArray.push(newModel);
        return newModel;
    }


}