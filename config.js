const config = {
    // The factor by which we scale our walls in the x and z dimensions (horizontally).
    WALL_HOR_SCALE_FACTOR: 30,
    // The factor by which we scale our walls in the y dimension (vertically).
    WALL_VERT_SCALE_FACTOR: 20,
    // For some reason, our walls initially have this diameter, instead of diameter 1.
    // I have no idea why, so I don't know how to derive it, hence hardcoding.
    NEW_PRESCALE_WALL_DIAMETER: 1.4399796724319458,
    // The original diameter of the wall when created in Vectary.
    // Required because I did all my calculations in that coordinate system.
    ORIGINAL_WALL_DIAMETER: 10.5,
    // The maximum amount that the camera (when restricted) is allowed to rotate in either direction vertically.
    // Compared to abs(psi) (an Euler angle).
    MAX_CAM_VERT_ROTATION: 0.1,
};

export { config };
