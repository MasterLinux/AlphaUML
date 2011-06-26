/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:38
 */

dojo.provide("ui.classDiagram.Connector");

dojo.require("ui.Object");
dojo.require("ui.util.Math");
dojo.require("ui.classDiagram.connector.Point");

dojo.declare("ui.classDiagram.Connector", ui.Object, {
    UPDATE_EVENT: null,
    math: null,

    //the two classes who
    //connects to each other
    parents: null,

    //connector points
    p0: null,
    p1: null,
    p2: null,
    p3: null,

    //todo create special subclasses for other types
    //association, aggregation, composition
    type: null,

    dnd: null,

    /**
     * args: {
     *   x0: integer,
     *   y0: integer,
     *   x1: integer,
     *   y1: integer
     * }
     * @param args
     */
    constructor: function(args) {
        this.math = new ui.util.Math();

        //create start point
        this.p0 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x0,
            y: args.y0
        });

        //create end point
        this.p3 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x1,
            y: args.y1
        });

        this.create();
    },

    /**
     * creates connector
     */
    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //set event names
        this.UPDATE_EVENT = "_update_" + this.htmlId;

        //create start and end point
        this.p0.create();
        this.p3.create();

        this.subscribe({
            event: this.p3.MOVE_EVENT,
            method: dojo.hitch(this, function() {
                this.update("p0");
            })
        });

        this.subscribe({
            event: this.p0.MOVE_EVENT,
            method: dojo.hitch(this, function() {
                this.update("p3");
            })
        });

        //update positions
        this.update();
    },

    /**
     * sets the position of the start and/or end point
     * @param x0 integer
     * @param y0 integer
     * @param x1 integer
     * @param y1 integer
     */
    setPosition: function(x0, y0, x1, y1) {
        if(x0 || y0) this.p0.setPosition(x0, y0);
        if(x1 || y1) this.p3.setPosition(x1, y1);
    },

    /**
     * updates the position of
     * each point and line
     * @pointName string name of the point which class-position will be updated
     */
    update: function(pointName) {
        var pos = this.math.angleArea(this.p0, this.p3);
        var p1x = 0;
        var p1y = 0;
        var p2x = 0;
        var p2y = 0;

        //p3 is beside p0
        if(pos == 2 || pos == 3 || pos == 6 || pos == 7) {
            //calculate the x-coordinate of p1 and p2
            var x = (this.math.deltaX(this.p0, this.p3)/2) + Math.min(this.p0.x, this.p3.x);

            //get positions
            p1x = x;
            p1y = this.p0.y;
            p2x = x;
            p2y = this.p3.y;
        }

        //p3 is above or below p0
        else {
            //calculate the y-coordinate of p1 and p2
            var y = (this.math.deltaY(this.p0, this.p3)/2) + Math.min(this.p0.y, this.p3.y);

            //get positions
            p1x = this.p0.x;
            p1y = y;
            p2x = this.p3.x;
            p2y = y;
        }

        //set position of p1 if already exists
        if(this.p1) this.p1.setPosition(p1x, p1y);

        //otherwise create new point
        else {
            this.p1 = new ui.classDiagram.connector.Point({
                placeAt: this.placeAt,
                x: p1x,
                y: p1y
            });

            this.p1.create();
        }

        //set position of p2 if already exists
        if(this.p2) this.p2.setPosition(p2x, p2y);

        //otherwise create new point
        else {
            this.p2 = new ui.classDiagram.connector.Point({
                placeAt: this.placeAt,
                x: p2x,
                y: p2y
            });

            this.p2.create();
        }

        //update position of the unmoved point
        if(pointName) {
            var side = "";

            //bottom
            if(pos == 1 || pos == 8) {
                //console.debug(pointName + " - bottom");
                side = "bottom";
            }

            //left
            else if(pos == 2 || pos == 3) {
                //console.debug(pointName + " - left");
                side = "left";
            }

            //top
            else if(pos == 4 || pos == 5) {
                //console.debug(pointName + " - top");
                side = "top";
            }

            //right
            else if(pos == 6 || pos == 7) {
                //console.debug(pointName + " - right");
                side = "right";
            }

            //throw update event
            dojo.publish(this.UPDATE_EVENT, [{
                htmlId: this.htmlId,
                pointName: pointName,
                point: this[pointName],
                side: side
            }]);
        }
    }

});
