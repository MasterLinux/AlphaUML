/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:38
 */

dojo.provide("ui.classDiagram.Connector");

dojo.require("ui.Object");
dojo.require("ui.util.Math");
dojo.require("ui.classDiagram.connector.Point");
dojo.require("ui.classDiagram.connector.Line");

dojo.declare("ui.classDiagram.Connector", ui.Object, {
    connectorLabel: null,
    navigationDir: null,
    readingDir: null,
    direction: null,
    name: null,
    type: null,
    math: null,

    //the two classes who
    //connects to each other
    p0Class: null,
    p3Class: null,

    //connector points
    p0: null,
    p1: null,
    p2: null,
    p3: null,

    //connector lines
    l0: null,
    l1: null,
    l2: null,

    /**
     * args: {
     *   x0: integer,
     *   y0: integer,
     *   x1: integer,
     *   y1: integer
     *   type: string "Composition", "Aggregation", "Association" or "Generalization",
     *   direction: string point name "p0", "p1" or "both"
     *   name: string association name
     * }
     * @param args
     */
    constructor: function(args) {
        this.math = new ui.util.Math();
        this.navigationDir = args.navigationDir;
        this.readingDir = args.readingDir;
        this.direction = args.direction || "p0";
        this.name = args.name;
        this.type = args.type;

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
    },

    /**
     * creates connector
     */
    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //create start and end point
        this.p0.create();
        this.p3.create();

        //listen to move events
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
     * registers a class to
     * a specific point
     * @param c0 ui.classDiagram.Class
     * @param p0 string point name "p0" (start point) or "p1" (end point)
     * @param c1 ui.classDiagram.Class
     * @param p1 string point name "p0" (start point) or "p1" (end point)
     */
    registerClass: function(c0, p0, c1, p1) {
        //init connect side
        var c0Pos = dojo.position(c0.htmlId, true);
        var c1Pos = dojo.position(c1.htmlId, true);
        var p0Side = this.math.calcSide(c0Pos, c1Pos);
        var p1Side = this.math.calcSide(c1Pos, c0Pos);
        this.p0.setConnectSide(p0Side);
        this.p3.setConnectSide(p1Side);

        //store class
        this.p0Class = c0;
        this.p3Class = c1;

        //set initial position
        this.setPosition("p0");
        this.setPosition("p1");

        //TODO if p0Class changed remove old event listener
        //listen to move events
        this.subscribe({
            event: c0.MOVE_EVENT,
            method: function() {
                this.setPosition("p0");
            }
        });

        //listen to move events
        this.subscribe({
            event: c1.MOVE_EVENT,
            method: function() {
                this.setPosition("p1");
            }
        });
    },

    /**
     * sets new position of a specific point
     * @param string point name "p0" or "p1"
     */
    setPosition: function(point) {
        point = (point == "p1") ? "p3" : "p0";
        var pClass = point + "Class";

        //get new position and range of the point
        var range = this[pClass].getConnectRange(this[point]);

        //set move range
        this[point].setMoveRange(range.range, range.side);

        //set position
        this[point].setPosition(range.x, range.y);
    },

    /**
     * updates the position of
     * each point and line
     * @pointName string name of the point which class-position will be updated
     */
    update: function(pointName) {
        var c0Pos, c1Pos, p0Side, p1Side;
        var p1x = 0, p1y = 0, p2x = 0, p2y = 0;

        //get connect side and position of each class
        if(this.p0Class && this.p3Class) {
            c0Pos = dojo.position(this.p0Class.htmlId, true);
            c1Pos = dojo.position(this.p3Class.htmlId, true);
            //get class origin
            c0Pos = this.math.origin(c0Pos);
            c1Pos = this.math.origin(c1Pos);
            //get side
            p0Side = this.math.calcSide(c0Pos, c1Pos) || "left";
            p1Side = this.math.calcSide(c1Pos, c0Pos) || "right";

            //update and set connector type and direction
            if(this.type && (this.direction == "p0" || this.direction == "both")) {
                this.p0.setType(this.type, this.p0.getDirection(c1Pos, c0Pos));
            }

            if(this.type && (this.direction == "p1" || this.direction == "both")) {
                this.p3.setType(this.type, this.p3.getDirection(c0Pos, c1Pos));
            }

            //TODO remove
            if(!this.connectorLabel && this.p0) {
                this.connectorLabel = new ui.classDiagram.ConnectorLabel({
                    placeAt: this.placeAt,
                    parent: this.p0,
                    label: "Mitarbeiter",
                    side: "above",
                    offsetX: 3,
                    offsetY: 3
                });

                this.connectorLabel.create();
            }
            if(this.connectorLabel)
                this.connectorLabel.update();
        }

        if(this.p1 && this.p2) {
            //update point size
            this.p0.getSize();
            this.p1.getSize();
            this.p2.getSize();
            this.p3.getSize();

            //get point origin
            var p0Pos = this.math.origin(this.p0);
            var p3Pos = this.math.origin(this.p3);

            //p3 is beside p0
            if(p0Side == "left" || p0Side == "right") {
                //calculate the x-coordinate of p1 and p2
                var x = (this.math.deltaX(this.p0, this.p3)/2) + Math.min(this.p0.x, this.p3.x);

                //get positions
                p1x = x;
                p1y = p0Pos.y - this.p1.h/2;
                p2x = x;
                p2y = p3Pos.y - this.p2.h/2;
            }

            //p3 is above or below p0
            else {
                //calculate the y-coordinate of p1 and p2
                var y = (this.math.deltaY(this.p0, this.p3)/2) + Math.min(this.p0.y, this.p3.y);

                //get positions
                p1x = p0Pos.x - this.p1.w/2;
                p1y = y;
                p2x = p3Pos.x - this.p2.w/2;
                p2y = y;
            }
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

        //update position on side change
        if(p0Side && this.p0.connectSide != p0Side) {
            this.p0.setConnectSide(p0Side);
            this.setPosition("p0");
        }

        if(p1Side && this.p3.connectSide != p1Side) {
            this.p3.setConnectSide(p1Side);
            this.setPosition("p1");
        }

        //update lines
        if(this.l0) this.l0.update(this.p0, this.p1);
        else {
            //create new line
            this.l0 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l0.create();
        }

        if(this.l1) this.l1.update(this.p1, this.p2);
        else {
            //create new line
            this.l1 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l1.create();
        }

        if(this.l2) this.l2.update(this.p2, this.p3);
        else {
            //create new line
            this.l2 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l2.create();
        }
    }

});

dojo.declare("ui.classDiagram.ConnectorLabel", ui.Object, {
    offsetX: null,
    offsetY: null,
    menuStructure: null,
    isSelected: null,
    parent: null,
    label: null,
    menu: null,
    labelId: null,
    inputId: null,
    math: null,
    side: null,

    /**
     * args: {
     *  parent: ui.classDiagram.connector.Line || ...connector.Point,
     *  label: string,
     *  placeAt: string parent id,
     *  side: string "above" or "below"
     * }
     * @param args object
     */
    constructor: function(args) {
        this.parent = args.parent;
        this.label = args.label || "";
        this.math = new ui.util.Math();
        this.side = args.side;
        this.offsetX = args.offsetX || 0;
        this.offsetY = args.offsetY || 0;
    },

    create: function() {
        this.inherited(arguments);

        this.labelId = this.htmlId + "Label";
        this.inputId = this.htmlId + "Input";

        dojo.place(
            '<div class="ConnectorLabel" id="' + this.htmlId + '">' +
                '<div class="label" id="' + this.labelId + '"></div>' +
                '<input class="input" style="opacity: 0; display: none;" id="' + this.inputId + '" />' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //setup properties
        this.setLabel(this.label);
        this.update();

        //create a new context menu
        if(this.menuStructure && !this.menu) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.labelId]);
        }
    },

    /**
     * updates the position
     */
    update: function() {
        var posX, posY;

        var node = dojo.byId(this.htmlId);
        var width = dojo.style(node, "width");
        var height = dojo.style(node, "height");

        //calc origin
        var origin = {
            x: width/2,
            y: height/2
        };

        //get point coordinates
        if(this.parent.uiType == "point") {
            posX = this.parent.x - origin.x;
            posY = this.parent.y - origin.y;

            //set offset
            if(this.parent.direction == "north") {
                //label has to place on the bottom side
                if(this.side == "above") {
                    posX += (origin.x + this.offsetX + this.parent.w);
                    posY += (origin.y + this.offsetY + this.parent.h);
                } else if(this.side == "below") {
                    posX -= (origin.x + this.offsetX);
                    posY += (origin.y + this.offsetY + this.parent.h);
                }
            } else if(this.parent.direction == "east") {
                //label has to place on the left side
                if(this.side == "above") {
                    posX -= (origin.x + this.offsetX);
                    posY -= (origin.y + this.offsetY);
                } else if(this.side == "below") {
                    posX -= (origin.x + this.offsetX);
                    posY += (origin.y + this.offsetY + this.parent.h);
                }
            } else if(this.parent.direction == "south") {
                //label has to place on the top side
                if(this.side == "above") {
                    posX -= (origin.x + this.offsetX);
                    posY -= (origin.y + this.offsetY);
                } else if(this.side == "below") {
                    posX += (origin.x + this.offsetX  + this.parent.w);
                    posY -= (origin.y + this.offsetY);
                }
            } else if(this.parent.direction == "west") {
                //label has to place on the right side
                if(this.side == "above") {
                    posX += (origin.x + this.offsetX + this.parent.w);
                    posY -= (origin.y + this.offsetY);
                } else if(this.side == "below") {
                    posX += (origin.x + this.offsetX + this.parent.w);
                    posY += (origin.y + this.offsetY + this.parent.h);
                }
            }
        }

        //get line coordinates
        else if(this.parent.uiType == "line") {
            //horizontal
            if(this.parent.side === 0) {
                posX = this.parent.x + this.parent.w/2 - origin.x;
                posY = this.parent.y - origin.y;
            }

            //vertical
            else {
                posX = this.parent.x - origin.x;
                posY = this.parent.y + this.parent.h/2 - origin.y;
            }
        }

        //set position
        this.setPosition(posX, posY);
    },

    /**
     * sets the label
     * @param label
     */
    setLabel: function(label) {
        this.label = label || this.label || "";
        var node = dojo.byId(this.labelId);
        var input = dojo.byId(this.inputId);
        node.innerHTML = this.label;
        input.value = this.label;
    },

    /**
     * selects or deselects label
     * @param select
     */
    select: function(select) {
        select = (typeof select == "boolean") ? select : !this.isSelected;
        this.isSelected = select;
        var input = dojo.byId(this.inputId);

        //show text input
        if(select) {
            this.hide(0, this.labelId);

            dojo.addClass(input, "selected");
            dojo.removeAttr(input, "readonly");
            this.show(0, this.inputId);

            //set cursor
            input.selectionStart = input.value.length;
            input.selectionEnd = input.value.length;
        }

        //show label
        else {
            dojo.attr(input, "readonly", "readonly");
            dojo.removeClass(input, "selected");
            this.hide(0, this.inputId);

            this.setLabel(input.value);
            this.show(0, this.labelId);
        }
    }
});
