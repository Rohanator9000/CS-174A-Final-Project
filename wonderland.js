import {tiny, defs} from './common.js';

const {Scene} = tiny;

export class Wonderland extends Scene {
    constructor() {
        super();
    }

    display(context, program_state) {
        // Add movement controls.
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
        }
    }
}
