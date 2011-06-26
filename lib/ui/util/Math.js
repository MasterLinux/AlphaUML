/**
 * User: Christoph Grundmann
 * Date: 05.06.11
 * Time: 23:07
 *
 * a small collection of
 * usefully math functions
 */
dojo.provide("ui.util.Math");

dojo.declare("ui.util.Math", null, {
    /**
     * returns whether p1 is beside (returns 0) or
     * above/below (returns 1) p0
     * @param p0 object {x:int, y:int}
     * @param p1 object {x:int, y:int}
     */
    position: function(p0, p1) {
        //calculate the slope
        var m = (p0.y - p1.y) / (p1.x - p0.x);

        if(m > -1 && m < 1) {
            //p1 is beside p0
            return 0;
        } else {
            //p1 is above or below p0
            return 1;
        }
    },

    /**
     * gets the delta of two x-coordinates
     * @param p0 object {x:int, y:int}
     * @param p1 object {x:int, y:int}
     */
    deltaX: function(p0, p1) {
        return Math.abs(p1.x - p0.x);
    },

    /**
     * gets the delta of two y-coordinates
     * @param p0 object {x:int, y:int}
     * @param p1 object {x:int, y:int}
     */
    deltaY: function(p0, p1) {
        return Math.abs(p0.y - p1.y);
    },
    
    /**
     * creates a vector with the given
     * points and calculates the angle.
     * TODO documentation
     * @param p1
     * @param p2
     */
    angleArea: function(p1, p2) {
        var angle = 0;
        var position = 0;
        var normal = {x: 0, y: 1};

        //vector of the two points
        var vector = {
            x: p2.x - p1.x,
            y: p1.y - p2.y
        };

        //normalize vector
        vector = this.normalize(vector);

        //get the dot product of the two vectors
        var scalar = this.dotProduct(normal, vector);

        //store scalar as angle
        angle = scalar;

        //calculate a unique float for each angle
        if(vector.x < 0 && vector.y < 0) {
            angle = - 2 + Math.abs(scalar);
        } else if(vector.x == -1 && vector.y == 0) {
            angle = -2;
        } else if(vector.x < 0 && vector.y >= 0) {
            angle = -2 - angle;
        }

        //get the position number
        if(angle <= 1 && angle > 0.5) {
            position = 1;
        } else if(angle <= 0.5 && angle > 0) {
            position = 2;
        } else if(angle <= 0 && angle > -0.5) {
            position = 3;
        } else if(angle <= -0.5 && angle > -1) {
            position = 4;
        } else if(angle <= -1 && angle > -1.5) {
            position = 5;
        } else if(angle <= -1.5 && angle > -2) {
            position = 6;
        } else if(angle <= -2 && angle > -2.5) {
            position = 7;
        } else if(angle <= -2.5 && angle > -3) {
            position = 8;
        }

        //TODO return angle and position number
        return position;
    },

    /**
     * creates the dot product
     * of two vectors
     * @param vecA
     * @param vecB
     */
    dotProduct: function(vecA, vecB) {
        //calc the denominator
        var den = vecA.x * vecB.x + vecA.y * vecB.y;
        //calc the numerator
        var num = this.absolute(vecA) * this.absolute(vecB);

        return den/num;
    },

    /**
     * calculates the absolute value
     * of a 2 dimensional vector
     * @param vec
     */
    absolute: function(vec) {
        return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
    },

    /**
     * normalizes a vector
     * @param vec
     */
    normalize: function(vec) {
        var abs = this.absolute(vec);
        //vec * 1/|vec|
        var x = vec.x * (1/abs);
        var y = vec.y * (1/abs);
        //return normalized vec
        return {x: x, y: y};
    }
});

