import React, {Component} from "react";
import {
    FreeCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    Scene,
    Mesh,
    SceneLoader,
    ArcRotateCamera, Animation, ISceneLoaderAsyncResult
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import SceneComponent from "./SceneComponent";
import "./App.css";
import {ModelLoader} from "./ModelLoader";

let plane:any;

const onSceneReady = (scene: Scene) => {
    const canvas = scene.getEngine().getRenderingCanvas();

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 2.7, 14, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    const light2 = new HemisphericLight("light", new Vector3(-1, 1, 0), scene);
    light.intensity = 2;

    let ground = MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.position.y = -6;

    let modelLoader = new ModelLoader();
    modelLoader.getConfiguratin();
    let plane = modelLoader.loadModel("plane");
    plane.setPosition(new Vector3(1,1,-1));
    setTimeout(() => plane.playAnimation("extraKepesseg"), 4000);
    setTimeout(() => plane.setState("halad"), 10000);
    setTimeout(() => plane.playAnimation("extraKepesseg"), 12000);
    setTimeout(() => plane.setState(""), 20000);
    setTimeout(() => plane.destroy(), 24000);

};


const onRender = (scene: Scene) => {

};

export default class App extends Component {
    render() {
        return (
            <div className="app">
                <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas"/>
            </div>
        );
    }
}

