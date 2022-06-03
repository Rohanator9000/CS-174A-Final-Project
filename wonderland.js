import { tiny, defs } from "./external/common.js";
import { Shape_From_File } from "./external/obj-file-demo.js";
import { Custom_Movement_Controls } from "./custom-movement.js";
import { config } from "./config.js";

const { Cube, Torus } = defs;
const { Vector, vec4, color, Mat4, Light, Material, Scene, Texture, hex_color, Shader, Matrix } = tiny;
const { scale, translation, perspective } = Mat4;

export class Wonderland extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
            walls: new Shape_From_File("assets/walls.obj"),
            obelisk_base: new Cube(),
            obelisk_tip: new Shape_From_File("assets/pyramid.obj"),
            sphere_sub_6: new defs.Subdivision_Sphere(6),
            torus: new defs.Torus(15, 15),
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
            obelisk_base: new Material(new defs.Textured_Phong(1), {
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
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#ffffff")}),
            planet_1: new Material(new defs.Phong_Shader(), 
                {ambient: 0.7, diffusivity: 0.75, specularity: 0.75, color: hex_color("#808080")}),
            planet_2_phong: new Material(new defs.Phong_Shader(), 
                {ambient: 0.5, diffusivity: 0.75, specularity: 0.75, color: hex_color("#80FFFF")}),
            planet_3: new Material(new defs.Phong_Shader(), 
                {ambient: 0.5, diffusivity: 0.75, specularity: 0.75, color: hex_color("#B08040")}),
            planet_4: new Material(new defs.Phong_Shader(), 
                {ambient: 0.5, diffusivity: 0.75, specularity: 0.75, color: hex_color("#93CAED")}),
            ring: new Material(new Ring_Shader(), 
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#B08040")}),
            moon: new Material(new defs.Phong_Shader(), 
                {ambient: 0.5, diffusivity: 0, specularity: 1, color: hex_color("#FF69B4")})
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

    find_y_pos_1(t) {
        // 1 period per 4 seconds -> 0.25 period per 1 second -> frequency
        const amplitude = 1, freq = 0.75, angular_freq = 2 * Math.PI * freq;
        var y_pos = 8 + amplitude * Math.sin(angular_freq * t);
        return y_pos;
    }

    find_y_pos_2(t) {
        // 1 period per 4 seconds -> 0.25 period per 1 second -> frequency
        const amplitude = 1, freq = 0.75, angular_freq = 2 * Math.PI * freq;
        var y_pos = 8 + amplitude * Math.sin(angular_freq * t + Math.PI);
        return y_pos;
    }

    draw_obelisk(program_state, context) {
        const model_transform_obelisk_base = Mat4.translation(0, 5, 0).times(
            Mat4.scale(0.5, 5, 0.5)
        );
        this.shapes.obelisk_base.draw(
            context,
            program_state,
            model_transform_obelisk_base,
            this.materials.obelisk_base
        );
        const model_transform_obelisk_tip = Mat4.translation(0, 10.4, 0).times(
            Mat4.scale(0.4, 0.4, 0.4)
        );
        this.shapes.obelisk_tip.draw(
            context,
            program_state,
            model_transform_obelisk_tip,
            this.materials.obelisk_tip
        );
    }

    draw_orbs(program_state, context) {
        let model_transform = Mat4.identity();
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const gray = hex_color("#808080");
        const green_blue = hex_color("#80FFFF");
        const muddy_brown = hex_color("#B08040");
        const light_blue = hex_color("#93CAED");
        const y_pos_1 = this.find_y_pos_1(t);
        const y_pos_2 = this.find_y_pos_2(t);
            
        // PLANETS 1 ~ 4
        const planet_radius = 1;

        // COLUMN 1
        // ORB 1
        let model_transform_planet1 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(2, y_pos_1, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet1, this.materials.planet_1.override({color: gray}));
        this.planet_1 = model_transform_planet1;
        // ORB 2
        let model_transform_planet1_1 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(4, y_pos_2, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet1_1, this.materials.planet_1.override({color: green_blue}));
        this.planet_1_1 = model_transform_planet1_1;
        // ORB 3
        let model_transform_planet1_2 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(6, y_pos_1, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet1_2, this.materials.planet_1.override({color: muddy_brown}));
        this.planet_1_2 = model_transform_planet1_2;

        // COLUMN 2
        // ORB 1
        let model_transform_planet2 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(-2, y_pos_1, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet2, this.materials.planet_2_phong.override({color: green_blue}));
        this.planet_2 = model_transform_planet2;
        // ORB 2
        let model_transform_planet2_1 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(-4, y_pos_2, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet2_1, this.materials.planet_2_phong.override({color: muddy_brown}));
        this.planet_2_1 = model_transform_planet2_1;
        // ORB 3
        let model_transform_planet2_2 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(-6, y_pos_1, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet2_2, this.materials.planet_2_phong.override({color: light_blue}));
        this.planet_2_2 = model_transform_planet2_2;

        // COLUMN 3
        // ORB 1
        let model_transform_planet3 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_1, 2));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet3, this.materials.planet_3.override({color: muddy_brown}));
        this.planet_3 = model_transform_planet3;
        // ORB 2
        let model_transform_planet3_1 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_2, 4));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet3_1, this.materials.planet_3.override({color: light_blue}));
        this.planet_3_1 = model_transform_planet3_1;
        // ORB 3
        let model_transform_planet3_2 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_1, 6));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet3_2, this.materials.planet_3.override({color: gray}));
        this.planet_3_2 = model_transform_planet3_2;
            
        // COLUMN 4
        // ORB 1
        let model_transform_planet4 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_1, -2));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet4, this.materials.planet_4.override({color: light_blue}));
        this.planet_4 = model_transform_planet4;
        // ORB 2
        let model_transform_planet4_1 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_2, -4));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet4_1, this.materials.planet_4.override({color: gray}));
        this.planet_4 = model_transform_planet4_1;
        // ORB 3
        let model_transform_planet4_2 = model_transform.times(Mat4.rotation(2*t, 0, 1, 0)).times(Mat4.translation(0, y_pos_1, -6));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet4_2, this.materials.planet_4.override({color: green_blue}));
        this.planet_4 = model_transform_planet4_2;
    }

    draw_solar_system_above(program_state, context) {
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(0, 50, 0));
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        // this.shapes.torus.draw(context, program_state, model_transform, this.materials.test.override({color: yellow}));
        const white = hex_color("#ffffff");

        // color and size of sun
            // change -1 to 1 to 1 to 3
                // requirement: 1 cycle per 10 seconds
                // amplitude = 2
                // freq = 0.1 cycle / sec
                // angular_freq = 2 * pi * freq
                // y = amplitude * sin(angular_freq * time)
        const sun_radius = 2 + Math.sin(2 * Math.PI * t / 10);
        // const sun_radius = 3;

        // red at smallest to white at largest
        const sun_color = color(1, sun_radius / 2 - 0.5, sun_radius / 2 - 0.5, 1);

        let model_transform_sun = model_transform.times(Mat4.scale(sun_radius, sun_radius, sun_radius));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_sun, this.materials.sun.override({color: sun_color}));

        // DRAW LIGHT
        const light_size = 10 ** sun_radius;
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, sun_color, light_size)];

        // PLANETS 1 ~ 4
        const planet_radius = 1;

        // PLANET 1
        const gray = hex_color("#808080");
        let model_transform_planet1 = model_transform.times(Mat4.rotation(t, 0, 1, 0)).times(Mat4.translation(5, 0, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet1, this.materials.planet_1.override({color: gray}));
        // camera matrix
        this.planet_1 = model_transform_planet1;

        // PLANET 2
        const green_blue = hex_color("#80FFFF");
        let model_transform_planet2 = model_transform.times(Mat4.rotation(t/1.1, 0, 1, 0)).times(Mat4.translation(8, 0, 0));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet2, this.materials.planet_2_phong.override({color: green_blue}));
        this.planet_2 = model_transform_planet2;

        // PLANET 3
        const muddy_brown = hex_color("#B08040");
        let model_transform_planet3 = model_transform.times(Mat4.rotation(t/1.2, 0, 1, 0)).times(Mat4.translation(11, 0, 0));
        this.planet_3 = model_transform_planet3;
        // self-rotation (wobble)
        model_transform_planet3 = model_transform_planet3.times(Mat4.rotation(t/1.2, 0.5, 0.8, 1));
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet3, this.materials.planet_3.override({color: muddy_brown}));
        // draw the ring
        let model_transform_ring = model_transform_planet3.times(Mat4.scale(3, 3, 0.1));
        this.shapes.torus.draw(context, program_state, model_transform_ring, this.materials.ring);

        // PLANET 4
        const light_blue = hex_color("#93CAED");
        let model_transform_planet4 = model_transform.times(Mat4.rotation(t/1.3, 0, 1, 0)).times(Mat4.translation(14, 0, 0));
        this.planet_4 = model_transform_planet4;
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_planet4, this.materials.planet_4.override({color: light_blue}));
        // moon
        const hot_pink = hex_color("#FF69B4");
        let model_transform_moon = model_transform_planet4.times(Mat4.rotation(t, 0, 1, 0)).times(Mat4.translation(2, 0, 0));
        this.moon = model_transform_moon;
        this.shapes.sphere_sub_6.draw(context, program_state, model_transform_moon, this.materials.moon.override({color: hot_pink}));
    }

    display(context, program_state) {
        // Add movement controls if not already created.
        if (!context.scratchpad.controls) {
            context.scratchpad.controls = new Custom_Movement_Controls();
            this.children.push(context.scratchpad.controls);
            program_state.set_camera(translation(0, -config.CAMERA_HEIGHT, 0));
        }

        program_state.projection_transform = perspective(
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

        // There is no reason we should have to subtract 1.5 from that number, but it works.
        const wall_vertical_translation =
            config.WALL_VERT_SCALE_FACTOR * config.NEW_PRESCALE_WALL_HEIGHT - 1.5;

        // Scale the wall and translate it up so the floor is at the origin.
        const wall_mt = translation(0, wall_vertical_translation, 0).times(
            scale(
                config.WALL_HOR_SCALE_FACTOR,
                config.WALL_VERT_SCALE_FACTOR,
                config.WALL_HOR_SCALE_FACTOR
            )
        );
        this.shapes.walls.draw(context, program_state, wall_mt, this.materials.alt_wall);

        // Draw main exhibit.
        this.draw_obelisk(program_state, context);
        this.draw_orbs(program_state, context);

        // Draw solar system up above
        this.draw_solar_system_above(program_state, context);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
            point_position = model_transform * vec4( position, 1.0 );

            // position of new center of ring
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            // compute the distance of the fragment to center
            vec3 distance = vec3(point_position.xyz - center.xyz);
            // set the a,pha value (brightness) of the fragment
            gl_FragColor = vec4( vec3(0.69, 0.50, 0.25), cos( length(distance) * 20.0));
        }`;
    }
}
