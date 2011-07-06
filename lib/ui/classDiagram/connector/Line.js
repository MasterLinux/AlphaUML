/**
 * User: Christoph Grundmann
 * Date: 27.06.11
 * Time: 16:50
 *
 */
dojo.provide("ui.classDiagram.connector.Line");
dojo.require("ui.Object");
dojo.require("ui.util.Math");

dojo.declare("ui.classDiagram.connector.Line", ui.Object, {
    thickness: null,
    math: null,
    width: null,
    height: null,
    x: null,
    y: null,

    constructor: function(args) {
        args = args || {};
        this.math = new ui.util.Math();
        this.thickness = args.thickness;
    },

    create: function() {
        this.inherited(arguments);

        dojo.place(
            '<div class="Line" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        this.setThickness(this.thickness);
    },

    /**
     * sets line type
     * @param type string "dashed" or "solid"
     */
    setType: function(type) {

    },

    /**
     * updates the size and position
     * @param p0 ui.classDiagram.connector.Point
     * @param p1 ui.classDiagram.connector.Point
     */
    update: function(p0, p1) {
        var width, height, x, y;
        var node = dojo.byId(this.htmlId);
        var side = this.math.position(p0, p1);

        //get origin
        var p0Origin = this.math.origin(p0);
        var p1Origin = this.math.origin(p1);

        //0 = p1 is beside p0
        if(side === 0) {
            width = this.math.deltaX(p0Origin, p1Origin);
            height = this.thickness;

            //get position
            if(p0Origin.x < p1Origin.x) {
                x = p0Origin.x;
                y = p0Origin.y;
            } else {
                x = p1Origin.x;
                y = p0Origin.y;
            }
        }

        //1 = p1 is above/below p0
        else {
            width = this.thickness;
            height = this.math.deltaY(p0Origin, p1Origin);

            //get position
            if(p0Origin.y < p1Origin.y) {
                x = p0Origin.x;
                y = p0Origin.y;
            } else {
                x = p0Origin.x;
                y = p1Origin.y;
            }
        }

        //store size
        this.width = width;
        this.height = height;

        //set size
        dojo.style(node, "width", width + "px");
        dojo.style(node, "height", height + "px");

        //update position
        this.setPosition(x, y);
    },

    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        x = x || this.x || 0;
        y = y || this.y || 0;
        this.x = x;
        this.y = y;

        if(node) {
            dojo.style(node, "left", this.x + "px");
            dojo.style(node, "top", this.y + "px");
        }
    },

    setThickness: function(thickness) {
        this.thickness = thickness || this.thickness || 2;
    }
});
