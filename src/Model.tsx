import {ISceneLoaderAsyncResult, SceneLoader, Vector3, Animation, Scene} from "@babylonjs/core";

export class Model {
    id: number;
    typename: string;
    mesh: any;  //promise
    states: Map<string, string>; //promise
    animations: Map<string, string>; //promise

    constructor(typename: string, config: any, id: number) {
        this.id = id;
        this.typename = typename;
        this.states = new Map();
        this.animations = new Map();
        this.mesh = this.LoadFromGLB(typename, config);
    }

    async LoadFromGLB(typename: string, config: any) {
        let configuration = await config;
        let result: ISceneLoaderAsyncResult;
        let baseStateNameInGLB = "as";
        for (let i in configuration.spaceshipTypes) {
            if (configuration.spaceshipTypes[i].typename == typename) {

                for (let j in configuration.spaceshipTypes[i].states) {
                    this.states.set(configuration.spaceshipTypes[i].states[j].name, configuration.spaceshipTypes[i].states[j].nameInGLB);

                    if (configuration.spaceshipTypes[i].states[j].name == "") {
                        baseStateNameInGLB = configuration.spaceshipTypes[i].states[j].nameInGLB;
                    }
                }
                for (let j in configuration.spaceshipTypes[i].animations) {
                    this.animations.set(configuration.spaceshipTypes[i].animations[j].name, configuration.spaceshipTypes[i].animations[j].nameInGLB);
                }

                result = await SceneLoader.ImportMeshAsync("", "", configuration.spaceshipTypes[i].url);
                let founded = false;
                for (let j in result.animationGroups) {
                    if (result.animationGroups[j].name == baseStateNameInGLB) {
                        result.animationGroups[j].play(true);
                        founded = true;
                    } else {
                        result.animationGroups[j].stop();
                    }
                }

                if (founded) {
                    console.log("Created modell:", "id: " + this.id, "typename: " + this.typename, "baseState set, play animation: " + baseStateNameInGLB);
                } else {
                    console.log("Created modell:", "id: " + this.id, "typename: " + this.typename, "Couldn't find baseState");
                }
                return result;
            }
        }
    }

    async setPosition(position: Vector3) {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            result.meshes[0].position = position;
        } catch (error) {
            console.error(error);
        }
    }

    async setRotation(position: Vector3) {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            result.meshes[0].rotation = position;
        } catch (error) {
            console.error(error);
        }
    }

    async setState(stateName: string) {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            for (const i in result.animationGroups) {
                if (result.animationGroups[i].name == this.states.get(stateName)) {
                    result.animationGroups[i].start(true, 1, result.animationGroups[i].from, result.animationGroups[i].to, true);
                } else if (result.animationGroups[i].isPlaying) {
                    result.animationGroups[i].stop();
                }
            }

        } catch (error) {
            console.error(error);
        }
    }

    async playAnimation(animationName: string) {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            for (const i in result.animationGroups) {
                if (result.animationGroups[i].name == this.animations.get(animationName)) {
                    result.animationGroups[i].start(false, 1, result.animationGroups[i].from, result.animationGroups[i].to, true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async destroy() {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            result.meshes[0].dispose();
        } catch (error) {
            console.error(error);
        }
    }
}