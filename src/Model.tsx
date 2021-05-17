import {
    ISceneLoaderAsyncResult,
    SceneLoader,
    Vector3,
    Animation,
    Scene,
    AnimationGroup,
    EventState
} from "@babylonjs/core";

class Transition {
    public from: string
    public to: string
    public nameInGLB: string

    constructor(from: string, to: string, nameInGLB: string) {
        this.from = from;
        this.to = to;
        this.nameInGLB = nameInGLB;
    }

}

export class Model {
    id: number;
    typename: string;
    mesh: any;  //promise
    states: Map<string, string>; //promise
    animations: Map<string, string>; //promise
    transitions: Array<Transition>; //promise
    currentState: string;
    nextState: string;

    constructor(typename: string, config: any, id: number) {
        this.id = id;
        this.typename = typename;
        this.states = new Map();
        this.animations = new Map();
        this.mesh = this.LoadFromGLB(typename, config);
        this.transitions = new Array<Transition>();
        this.currentState = "";
        this.nextState = ".";
    }

    async LoadFromGLB(typename: string, config: any) {
        let configuration = await config;
        let result: ISceneLoaderAsyncResult;
        let baseStateNameInGLB = "as";
        for (let i in configuration.modelTypes) {
            if (configuration.modelTypes[i].typename == typename) {

                for (let j in configuration.modelTypes[i].states) {
                    this.states.set(configuration.modelTypes[i].states[j].name, configuration.modelTypes[i].states[j].nameInGLB);

                    if (configuration.modelTypes[i].states[j].name == "") {
                        baseStateNameInGLB = configuration.modelTypes[i].states[j].nameInGLB;
                    }
                }
                for (let j in configuration.modelTypes[i].animations) {
                    this.animations.set(configuration.modelTypes[i].animations[j].name, configuration.modelTypes[i].animations[j].nameInGLB);
                }

                for (let j in configuration.modelTypes[i].transitions) {
                    this.transitions.push(new Transition(configuration.modelTypes[i].transitions[j].from, configuration.modelTypes[i].transitions[j].to, configuration.modelTypes[i].transitions[j].nameInGLB));
                }

                result = await SceneLoader.ImportMeshAsync("", "", configuration.modelTypes[i].url);
                let founded = false;
                for (let j in result.animationGroups) {
                    if (result.animationGroups[j].name == baseStateNameInGLB) {
                        result.animationGroups[j].play(true);
                        founded = true;
                    } else {
                        result.animationGroups[j].reset();
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

    transitionEnd = async (eventData: AnimationGroup, eventState: EventState) => {
        const result: ISceneLoaderAsyncResult = await this.mesh;
        console.log(eventData.name + " atmenet animacio vege.");

        for (const j in result.animationGroups) {
            if (result.animationGroups[j].name == this.states.get(this.nextState)) {
                result.animationGroups[j].start(true, 1, result.animationGroups[j].from, result.animationGroups[j].to, true);
                this.currentState = this.nextState;
                this.nextState = ".";
                console.log("Uj allapotba lepett. (" + this.currentState + ") lejatszott animacio: " + result.animationGroups[j].name);
            } else if (result.animationGroups[j].isPlaying) {
                result.animationGroups[j].reset();
                result.animationGroups[j].stop();
            }
        }
        eventData.onAnimationGroupEndObservable.clear();
    }

    async setState(stateName: string) {
        try {
            const result: ISceneLoaderAsyncResult = await this.mesh;
            console.log("Allapotvaltas")
            var transitionAvailable: Boolean = false;
            this.nextState = stateName;

            for (const i in this.transitions) {
                if (this.transitions[i].from == this.currentState && this.transitions[i].to == stateName) {  //ha van átmenet ez fut le
                    transitionAvailable = true;

                    for (const j in result.animationGroups) {
                        if (result.animationGroups[j].name == this.transitions[i].nameInGLB) {
                            result.animationGroups[j].onAnimationGroupEndObservable.add(this.transitionEnd);
                            result.animationGroups[j].start(false, 1, result.animationGroups[i].from, result.animationGroups[i].to, true);
                            console.log("Atmenet animacio indul. (" + result.animationGroups[j].name + ")");
                        } else if (result.animationGroups[j].isPlaying) {
                            result.animationGroups[j].reset();
                            result.animationGroups[j].stop();
                        }
                    }
                    return;
                }
            }

            if (!transitionAvailable) {                         //ha nincs átmenet ez fut le
                console.log("Nem talalhato atmenet animacio.");
                for (const i in result.animationGroups) {
                    if (result.animationGroups[i].name == this.states.get(stateName)) {
                        result.animationGroups[i].start(true, 1, result.animationGroups[i].from, result.animationGroups[i].to, true);
                        this.currentState = this.nextState;
                        this.nextState = ".";
                        console.log("Uj allapotba lepett. (" + this.currentState + ") lejatszott animacio: " + result.animationGroups[i].name);
                    } else if (result.animationGroups[i].isPlaying) {
                        result.animationGroups[i].stop();
                    }
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