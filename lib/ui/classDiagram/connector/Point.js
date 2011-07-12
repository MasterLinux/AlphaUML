/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:39
 */
dojo.provide("ui.classDiagram.connector.Point");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.util.Math");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.connector.Point", ui.Object, {
    MOVE_EVENT: null,
    readDir: null,
    direction: null,
    connectSide: null,
    moveRange: null,
    parentId: null,
    offset: null,
    lockX: null,
    lockY: null,
    type: null,
    math: null,
    onClick: null,
    onMouseOver: null,
    onMouseOut: null,
    isSelected: null,
    isHovered: null,
    roleVisibility: null,
    roleLabel: null,
    multiplicityLabel: null,
    multiplicity: null,
    role: null,
    dnd: null,
    prevX: null,
    prevY: null,
    x: null,
    y: null,
    w: null,
    h: null,

    /**
     * args: {
     * role: string association role
     * roleVisibility: string association role visibility
     * readDir: string "p0" or "p3" describes the direction to the specific connector end
     * }
     * @param args
     */
    constructor: function(args) {
        this.direction = args.direction || "";
        this.parentId = args.parentId;
        this.offset = args.offset || 0;
        this.type = args.type || "Point";
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.math = new ui.util.Math();
        this.uiType = "point";
        this.role = args.role;
        this.roleVisibility = args.roleVisibility;
        this.multiplicity = args.multiplicity;
        this.onClick = args.onClick;
        this.onMouseOver = args.onMouseOver;
        this.onMouseOut = args.onMouseOut;
        this.readDir = args.readDir;
    },

    create: function() {
        this.inherited(arguments);

        //create event names
        this.MOVE_EVENT = "_pos_" + this.htmlId;

        //place point
        dojo.place(
            '<div class="Point" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //set initial position and type
        this.setPosition(this.x, this.y, false);
        this.setType(this.type, this.direction);
        this.getSize();
        this.setAssociationRole(this.role, this.roleVisibility);
        this.setMultiplicity(this.multiplicity);

        //make point draggable
        this.dnd = new dojo.dnd.Moveable(this.htmlId);

        //throw change event
        this.dnd.onMoving = dojo.hitch(this, function(mover, leftTop) {
            this.x = leftTop.l;
            this.y = leftTop.t;

            //update labels
            if(this.roleLabel) this.roleLabel.update();
            if(this.multiplicityLabel) this.multiplicityLabel.update();

            dojo.publish(this.MOVE_EVENT);
        });

        //register onclick event
        this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function(event) {
                if(this.onClick) this.onClick(event);
            }
        });

        //mouse hover
        this.connect({
            event: "onmouseover",
            nodeId: this.htmlId,
            method: function() {
                if(this.onMouseOver) this.onMouseOver();
            }
        });

        //mouse out
        this.connect({
            event: "onmouseout",
            nodeId: this.htmlId,
            method: function() {
                if(this.onMouseOut) this.onMouseOut();
            }
        });
    },

    /**
     * destroys point
     * @param del
     */
    destroy: function(del) {
        if(this.roleLabel) this.roleLabel.destroy(true);
        if(this.multiplicityLabel) this.multiplicityLabel.destroy(true);

        this.inherited(arguments);
    },

    /**
     * selects this point
     * @param select
     */
    select: function(select) {
        select = select || !this.isSelected;
        this.isSelected = select;
        var node = dojo.byId(this.htmlId);

        if(select) dojo.addClass(node, "selected");
        else dojo.removeClass(node, "selected");
    },

    /**
     * makes point thicker
     * @param hover boolean
     */
    hover: function(hover) {
        hover = hover || !this.isHovered;
        this.isHovered = hover;
        var node = dojo.byId(this.htmlId);

        //hover point
        if(hover) {
            dojo.addClass(node, "hovered");

            //save position history
            this.prevX = this.x;
            this.prevY = this.y;
            var centerX = this.x - 3;
            var centerY = this.y - 3;

            //set center position
            this.setPosition(centerX, centerY);
        }

        //reset point
        else {
            dojo.removeClass(node, "hovered");

            //set old position
            this.setPosition(this.prevX, this.prevY);
        }

        //TODO update position
    },

    /**
     * sets a association name
     * @param role
     * @param visibility
     */
    setAssociationRole: function(role, visibility) {
        this.role = role || this.role || "empty";
        this.roleVisibility = visibility || this.roleVisibility || "public";

        //create new role label
        if(role && !this.roleLabel) {
            this.roleLabel = new ui.classDiagram.AssociationRole({
                visibility: visibility,
                placeAt: this.placeAt,
                parent: this,
                role: role,
                side: "above",
                offsetX: 3,
                offsetY: 3
            });

            this.roleLabel.create();
        }

        //activate existing role label
        else if(role && this.roleLabel) {
            this.roleLabel.activate();
        }

        else if(!role && this.roleLabel) {
            this.roleLabel.deactivate();
        }
    },

    /**
     * sets the multiplicity label
     * @param multiplicity string
     */
    setMultiplicity: function(multiplicity) {
        this.multiplicity = multiplicity || this.multiplicity || "1";
        
        //create multiplicity label
        if(multiplicity && !this.multiplicityLabel) {
            this.multiplicityLabel = new ui.classDiagram.ConMultiplicity({
                multiplicity: multiplicity,
                placeAt: this.placeAt,
                parent: this,
                side: "below",
                offsetX: 3,
                offsetY: 3
            });

            this.multiplicityLabel.create();
        }

        //activate existing label
        else if(multiplicity && this.multiplicityLabel) {
            this.multiplicityLabel.activate();
        }

        //otherwise deactivate it
        else if(!multiplicity && this.multiplicityLabel) {
            this.multiplicityLabel.deactivate();
        }
    },

    /**
     * sets new position
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        x = x || this.x || 0;
        y = y || this.y || 0;
        this.x = x;
        this.y = y;

        //replace point
        dojo.style(node, "left", this.x + "px");
        dojo.style(node, "top", this.y + "px");

        //update labels
        if(this.roleLabel) this.roleLabel.update();
        if(this.multiplicityLabel) this.multiplicityLabel.update();

        //throw change event
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * sets on which side of the parent
     * class this point is connected.
     * furthermore it locks a specific
     * move direction by interpreting
     * the connected side
     * @param side string "top", "right", "bottom" or "left"
     */
    setConnectSide: function(side) {
        side = side || "top";
        this.connectSide = side;

        //lock move direction
        if(side == "right" || side == "left") {
            this.lockX = true;
            this.lockY = false;
        } else {
            this.lockX = false;
            this.lockY = true;
        }
    },

    /**
     * sets the move range
     * range: {
     *   x0: integer,
     *   y0: integer,
     *   x1: integer,
     *   y1: integer
     * }
     * @param range object
     * @param side string
     */
    setMoveRange: function(range, side) {
        side = side || this.connectSide;
        if(side) this.setConnectSide(side);
        this.moveRange = range;
    },

    setOffset: function(offset) {
        this.offset = offset || 0;
    },

    /**
     * gets the direction in which
     * the point is looking
     * @param c0 ui.classDiagram.Class
     * @param c1 ui.classDiagram.Class
     * @return string "north", "east", "south" or "west"
     */
    getDirection: function(c0, c1) {
        var pos = this.math.calcSide(c0, c1);
        if(pos == "top") this.direction = "north";
        else if(pos == "right") this.direction = "east";
        else if(pos == "bottom") this.direction = "south";
        else if(pos == "left") this.direction = "west";
        return this.direction;
    },

    /**
     * sets the point type like a generalization
     * @param type string "Generalization", "Aggregation" ...
     * @param direction string "north", "east", "south" or "west"
     */
    setType: function(type, direction) {
        this.direction = direction || this.direction || "";
        this.type = type || this.type || "Point";
        var node = dojo.byId(this.htmlId);

        dojo.attr(node, "class", this.type + " " + this.direction)
    },

    /**
     * gets the points size
     */
    getSize: function() {
        var node = dojo.byId(this.htmlId);
        this.w = dojo.style(node, "width");
        this.h = dojo.style(node, "height");
        return {
            x: this.x,
            y: this.y
        }
    }
});