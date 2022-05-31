import { tiny } from "./external/common.js";

const { Mat4 } = tiny;

function lt(...vals) {
    /*
	Returns whether a series of values are monotonically increasing.

	I.e. lt(a,b,c) === (a < b < c).
	*/

    for (let i = 0; i < vals.length - 1; ++i) {
        if (vals[i] >= vals[i + 1]) {
            return false;
        }
    }

    return true;
}

function lte(...vals) {
    /*
	Returns whether a series of values are monotonically non-decreasing.

	I.e. lte(a,b,c) === (a <= b <= c).
	*/

    for (let i = 0; i < vals.length - 1; ++i) {
        if (vals[i] > vals[i + 1]) {
            return false;
        }
    }

    return true;
}

function even_scale(factor) {
    // Returns a Mat4 scaling by factor in all dimensions.
    return Mat4.scale(factor, factor, factor);
}

export { lt, lte, even_scale };
