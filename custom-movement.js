import { defs, tiny } from './external/common.js';

const { Movement_Controls } = defs;
const { Mat4 } = tiny;

class Custom_Movement_Controls extends Movement_Controls {
    /*
    Overrides default camera movement controls to allow for customization.
    */

    constructor() {
        super();

        // Config.
        this.lock_vertical_camera_translation = true;
        this.lock_vertical_camera_rotation = true;
        this.vertical_camera_rotation_limit = 0.1;

        // Euler angles. For display.
        this.psi = 0;
        this.phi = 0;
        this.theta = 0;
        this.other_theta = 0;
    }

    make_control_panel() {
        /*
        Override this function to customize the control panel (text + buttons).
        Most of it is copied.
        */

        this.control_panel.innerHTML += "Click and drag the scene to spin your viewpoint around it.<br>";
        this.live_string(box => box.textContent = "- Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2)
            + ", " + this.pos[2].toFixed(2));
        this.new_line();
        // The facing directions are surprisingly affected by the left hand rule:
        this.live_string(box => box.textContent = "- Facing: " + ((this.z_axis[0] > 0 ? "West " : "East ")
            + (this.z_axis[1] > 0 ? "Down " : "Up ") + (this.z_axis[2] > 0 ? "North" : "South")));

        /* WONDERLAND CHANGES START HERE. */
        // Show Euler angles (for debugging/experimenting).
        this.new_line();
        this.live_string(box => box.textContent = `- Theta: ${this.theta.toFixed(2)}. Other formula theta: ${this.other_theta.toFixed(2)}. Psi: ${this.psi.toFixed(2)}. Phi: ${this.phi.toFixed(2)}.`)

        // Add buttons to toggle camera locks.
        this.new_line();
        this.key_triggered_button("Toggle camera rotation lock.", ["5"], () => this.lock_vertical_camera_rotation = !this.lock_vertical_camera_rotation);
        this.key_triggered_button("Toggle camera translation lock.", ["6"], () => this.lock_vertical_camera_translation = !this.lock_vertical_camera_translation);
        /* WONDERLAND CHANGES END HERE. */

        this.new_line();
        this.new_line();

        this.key_triggered_button("Up", [" "], () => this.thrust[1] = -1, undefined, () => this.thrust[1] = 0);
        this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);
        this.new_line();
        this.key_triggered_button("Left", ["a"], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0);
        this.key_triggered_button("Back", ["s"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Right", ["d"], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0);
        this.new_line();
        this.key_triggered_button("Down", ["z"], () => this.thrust[1] = 1, undefined, () => this.thrust[1] = 0);

        const speed_controls = this.control_panel.appendChild(document.createElement("span"));
        speed_controls.style.margin = "30px";
        this.key_triggered_button("-", ["o"], () =>
            this.speed_multiplier /= 1.2, undefined, undefined, undefined, speed_controls);
        this.live_string(box => {
            box.textContent = "Speed: " + this.speed_multiplier.toFixed(2)
        }, speed_controls);
        this.key_triggered_button("+", ["p"], () =>
            this.speed_multiplier *= 1.2, undefined, undefined, undefined, speed_controls);
        this.new_line();
        this.key_triggered_button("Roll left", [","], () => this.roll = 1, undefined, () => this.roll = 0);
        this.key_triggered_button("Roll right", ["."], () => this.roll = -1, undefined, () => this.roll = 0);
        this.new_line();
        this.key_triggered_button("(Un)freeze mouse look around", ["f"], () => this.look_around_locked ^= 1, "#8B8885");
        this.new_line();
        this.key_triggered_button("Go to world origin", ["r"], () => {
            this.matrix().set_identity(4, 4);
            this.inverse().set_identity(4, 4)
        }, "#8B8885");
        this.new_line();

        this.key_triggered_button("Look at origin from front", ["1"], () => {
            this.inverse().set(Mat4.look_at(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0)));
            this.matrix().set(Mat4.inverse(this.inverse()));
        }, "#8B8885");
        this.new_line();
        this.key_triggered_button("from right", ["2"], () => {
            this.inverse().set(Mat4.look_at(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
            this.matrix().set(Mat4.inverse(this.inverse()));
        }, "#8B8885");
        this.key_triggered_button("from rear", ["3"], () => {
            this.inverse().set(Mat4.look_at(vec3(0, 0, -10), vec3(0, 0, 0), vec3(0, 1, 0)));
            this.matrix().set(Mat4.inverse(this.inverse()));
        }, "#8B8885");
        this.key_triggered_button("from left", ["4"], () => {
            this.inverse().set(Mat4.look_at(vec3(-10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
            this.matrix().set(Mat4.inverse(this.inverse()));
        }, "#8B8885");
        this.new_line();
        this.key_triggered_button("Attach to global camera", ["Shift", "R"],
            () => {
                this.will_take_over_graphics_state = true
            }, "#8B8885");
        this.new_line();
    }


    first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
        /*
        Override this function to customize WASD camera translation.

        Removes vertical camera translation.
        */

        // Compare mouse's location to all four corners of a dead box:
        const offsets_from_dead_box = {
            plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway],
            minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]
        };
        // Apply a camera rotation movement, but only when the mouse is
        // past a minimum distance (leeway) from the canvas's center:
        if (!this.look_around_locked)
            // If steering, steer according to "mouse_from_center" vector, but don't
            // start increasing until outside a leeway window from the center.
            for (let i = 0; i < 2; i++) {                                     // The &&'s in the next line might zero the vectors out:
                let o = offsets_from_dead_box,
                    velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame;
                // On X step, rotate around Y axis, and vice versa.
                this.matrix().post_multiply(Mat4.rotation(-velocity, i, 1 - i, 0));
                this.inverse().pre_multiply(Mat4.rotation(+velocity, i, 1 - i, 0));
            }
        this.matrix().post_multiply(Mat4.rotation(-.1 * this.roll, 0, 0, 1));
        this.inverse().pre_multiply(Mat4.rotation(+.1 * this.roll, 0, 0, 1));
        // Now apply translation movement of the camera, in the newest local coordinate frame.

        /* WONDERLAND CHANGES START HERE. */

        // Compute new camera location normally.
        const curr_loc = this.matrix();
        const new_loc = curr_loc.times(Mat4.translation(...this.thrust.times(-meters_per_frame)));

        // Reset the new y-coordinate back to the original y-coordinate (meaning it never changes).
        if (this.lock_vertical_camera_translation) {
            new_loc[1][3] = curr_loc[1][3];
        }

        // Set new camera location.
        this.matrix().set(new_loc);
        this.inverse().set(Mat4.inverse(new_loc));
    }

    third_person_arcball(radians_per_frame) {
        /*
        Override this function to customize mouse-drag camera rotation.

        Removes vertical camera rotation.
        */

        // Spin the scene around a point on an axis determined by user mouse drag:
        const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);

        /* WONDERLAND CHANGES START HERE. */

        // Set the vertical component of the mouse-drag to 0, preventing the camera from looking up or down.
        if (this.lock_vertical_camera_rotation) {
            dragging_vector[1] = 0;
        }

        // It's important to check the norm instead of directly using 0 in rotation().
        if (dragging_vector.norm() <= 0)
            return;

        const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(), dragging_vector[1], dragging_vector[0], 0);
        this.matrix().post_multiply(rotation);
        this.inverse().pre_multiply(rotation);

    }

    third_person_arcball_WIP(radians_per_frame) {
        /*
        WORK IN PROGRESS.
        Override this function to customize mouse-drag camera rotation.

        Limits vertical camera movement.
        Removes camera rotation about its own z-axis.
        */

        // Spin the scene around a point on an axis determined by user mouse drag:
        const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);

        /* WONDERLAND CHANGES START HERE. */

        // Set the vertical component of the mouse-drag to 0, preventing the camera from looking up or down.
        if (this.lock_vertical_camera_rotation) {
            dragging_vector[1] = 0;
        }

        /*
        Euler angle nonsense.
        See http://eecs.qmul.ac.uk/~gslabaugh/publications/euler.pdf and https://nghiaho.com/?page_id=846.
        */
        const curr = this.matrix();
        this.theta = -Math.asin(curr[2][0]); // "y"
        this.other_theta = Math.atan2(-curr[2][0], Math.sqrt(Math.pow(curr[2][1], 2) + Math.pow(curr[2][2], 2))); // other "y"
        this.psi = Math.atan2(curr[2][1], curr[2][2]) % Math.PI; // "x"
        this.phi = Math.atan2(curr[1][0], curr[0][0]) % Math.PI; // "z"

        // if (isNaN(this.rpsi)) {
        // 	console.log(`Error found! Values: ${curr[2][1]}, ${curr[2][2]}`);
        // }

        // Using psi to measure 'vertical' rotation, which could be totally wrong.
        if (Math.abs(this.psi) >= this.vertical_camera_rotation_limit) {
            if (this.psi < 0) {
                // Too far down.
                // console.log("too far down.")
                // dragging_vector[1] = Math.min(dragging_vector[1], 0);
                dragging_vector[1] = Math.max(dragging_vector[1], 0);
                // dragging_vector[1] = 0;
            } else {
                // console.log("too far up.")
                // dragging_vector[1] = 0;
                dragging_vector[1] = Math.min(dragging_vector[1], 0);
                // dragging_vector[1] = Math.max(dragging_vector[1], 0);
            }
        }

        if (dragging_vector.norm() <= 0)
            return;

        const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(),
            dragging_vector[1], dragging_vector[0], 0);
        // rotation[2][0] = 0;
        // rotation[2][1] = 0;
        // rotation[2][2] = 1;
        // console.log(rotation);
        const mat = curr.times(rotation);
        // const mat = rotation.times(curr);
        // mat[2][0] = 0;
        // mat[2][1] = 0;
        // mat[2][2] = 1;
        this.matrix().set(mat);
        this.inverse().set(Mat4.inverse(mat));
        // this.matrix().post_multiply(rotation);
        // this.inverse().pre_multiply(rotation);
    }
}

export { Custom_Movement_Controls }
