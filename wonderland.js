import { tiny, defs } from "./external/common.js";
import { Shape_From_File } from "./external/obj-file-demo.js";
import { Custom_Movement_Controls } from "./custom-movement.js";
import { even_scale } from "./utility.js";
import { config } from "./config.js";

const { Cube } = defs;
const { Vector, vec4, color, Mat4, Light, Material, Scene, Texture } = tiny;

export class Wonderland extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
            walls: new Shape_From_File("assets/walls.obj"),
            obelisk_base: new Cube(),
            obelisk_tip: new Shape_From_File("assets/pyramid.obj"),
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
            dali: new Material(new defs.Textured_Phong(1), {
                color: color(0, 0, 0, 1),
                ambient: 1,
                diffusivity: 0,
                specularity: 0,
                texture: new Texture("assets/dali.jpg", "LINEAR_MIPMAP_LINEAR"),
            }),
            obelisk_tip: new Material(new defs.Phong_Shader(), {
                ambient: 0.8,
                diffusivity: 0.34615,
                specularity: 0.95,
                color: color(0.83, 0.67, 0.22, 1),
            }),
            alt_wall: new Material(new defs.Phong_Shader(), {
                color: color(0.2, 0.3, 0.4, 1),
                ambient: 0.9,
                diffusivity: 0.5,
                specularity: 0.5,
            }),
        };

        // STUPID WAY OF DOING THIS
        this.shapes.obelisk_base.arrays.texture_coord = [
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 1),
            Vector.of(1, 1), // bottom face
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 1),
            Vector.of(1, 1), // top face
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 8),
            Vector.of(1, 8),
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 8),
            Vector.of(1, 8),
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 8),
            Vector.of(1, 8),
            Vector.of(0, 0),
            Vector.of(1, 0),
            Vector.of(0, 8),
            Vector.of(1, 8),
        ];
    }

    display(context, program_state) {
        // Add movement controls if not already created.
        if (!context.scratchpad.controls) {
            context.scratchpad.controls = new Custom_Movement_Controls();
            this.children.push(context.scratchpad.controls);
            program_state.set_camera(Mat4.identity());
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4,
            context.width / context.height,
            1,
            100
        );
        program_state.lights = [
            new Light(vec4(10, 20, 10, 1), color(1, 1, 1, 1), 1000),
            new Light(vec4(15, 20, 5, 1), color(1, 1, 1, 1), 1000),
        ];

        // Draw walls.
        this.shapes.walls.draw(
            context,
            program_state,
            even_scale(config.WALL_SCALING_FACTOR),
            this.materials.alt_wall
        );

        // Draw obelisk.
        const model_transform_obelisk_base = Mat4.translation(0, 2.5, 0).times(
            Mat4.scale(0.5, 5, 0.5)
        );
        this.shapes.obelisk_base.draw(
            context,
            program_state,
            model_transform_obelisk_base,
            this.materials.dali
        );
        const model_transform_obelisk_tip = Mat4.translation(0, 7.75, 0).times(
            Mat4.scale(0.4, 0.4, 0.4)
        );
        this.shapes.obelisk_tip.draw(
            context,
            program_state,
            model_transform_obelisk_tip,
            this.materials.obelisk_tip
        );
    }
}
