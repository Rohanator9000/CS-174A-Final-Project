import { tiny, defs } from "./external/common.js";
import { Shape_From_File } from "./external/obj-file-demo.js";
import { Custom_Movement_Controls } from "./custom-movement.js";

const { Cube } = defs;

const { Scene, Mat4, vec4, Light, color, Material, Texture } = tiny;
export class Wonderland extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
            walls: new Shape_From_File("assets/walls.obj"),
        };

        this.materials = {
            origin: new Material(new defs.Phong_Shader(), {
                ambient: 0.8,
                diffusivity: 0.8,
                color: color(0.6, 0, 0.6, 1),
            }),
            stars: new Material(new defs.Textured_Phong(1), {
                color: color(0.5, 0.5, 0.5, 1),
                ambient: 0.3,
                diffusivity: 0.5,
                specularity: 0.5,
                texture: new Texture("assets/stars.png"),
            }),
        };
    }

    display(context, program_state) {
        // Add movement controls.
        if (!context.scratchpad.controls) {
            this.children.push((context.scratchpad.controls = new Custom_Movement_Controls()));
            program_state.set_camera(Mat4.identity());
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4,
            context.width / context.height,
            1,
            100
        );
        program_state.lights = [new Light(vec4(10, 20, 10, 1), color(1, 1, 1, 1), 1000)];

        // Origin, for visual reference.
        this.shapes.cube.draw(context, program_state, Mat4.identity(), this.materials.origin);

        // Draw walls.
        this.shapes.walls.draw(
            context,
            program_state,
            Mat4.scale(10, 10, 10),
            this.materials.stars
        );
    }
}
