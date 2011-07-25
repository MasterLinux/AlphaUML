/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:38
 */

dojo.provide("ui.classDiagram.Connector");

dojo.require("ui.Object");
dojo.require("ui.util.Math");
dojo.require("ui.ContextMenu");
dojo.require("ui.classDiagram.connector.Point");
dojo.require("ui.classDiagram.connector.Line");
dojo.require("ui.dialog.AddGeneralization");
dojo.require("ui.dialog.AddAssociation");
dojo.require("ui.dialog.AddProvidedInterface");
dojo.require("ui.dialog.AddRequiredInterface");

dojo.declare("ui.classDiagram.Connector", ui.Object, {
    diagram: null,
    isSelected: null,
    isHovered: null,
    navigationDir: null,
    readingDir: null,
    direction: null,
    type: null,
    math: null,
    menu: null,
    isInterface: null,

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
     *   direction: string point name "p0", "p1" or "both",
     *   diagram: ui.content.ClassDiagram,
     *   isInterface: boolean
     * }
     * @param args
     */
    constructor: function(args) {
        this.math = new ui.util.Math();
        this.navigationDir = args.navigationDir;
        this.readingDir = args.readingDir;
        this.direction = args.direction || "p0";
        this.type = args.type;
        this.diagram = args.diagram;
        this.isInterface = args.isInterface;
        this.uiType = "connector";

        //create start point
        this.p0 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x0,
            y: args.y0,
            onClick: dojo.hitch(this, function(event) {
                this.select(true, event);
            }),
            onMouseOver: dojo.hitch(this, function() {
                this.hover(true);
            }),
            onMouseOut: dojo.hitch(this, function() {
                this.hover(false);
            })
        });

        //create end point
        this.p3 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x1,
            y: args.y1,
            onClick: dojo.hitch(this, function(event) {
                this.select(true, event);
            }),
            onMouseOver: dojo.hitch(this, function() {
                this.hover(true);
            }),
            onMouseOut: dojo.hitch(this, function() {
                this.hover(false);
            })
        });
    },

    /**
     * destroys connector completely
     * @param del
     */
    destroy: function(del) {
        //remove connector from classes
        this.p0Class.removeConnector(this.htmlId);
        this.p3Class.removeConnector(this.htmlId);

        //destroy lines and points
        this.p0.destroy(true);
        this.p1.destroy(true);
        this.p2.destroy(true);
        this.p3.destroy(true);
        this.l0.destroy(true);
        this.l1.destroy(true);
        this.l2.destroy(true);
        this.menu.destroy(true);

        this.inherited(arguments);
    },

    /**
     * creates connector
     */
    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //TODO work-arround, please find a better solution
        dojo.place(
            '<span uitype="' + this.uiType + '" style="position: absolute; z-index: 0; display: none;" id="' + this.htmlId + '"></span>',
            dojo.body()
        );

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

        //register connector
        this.p0Class.registerConnector(this);
        this.p3Class.registerConnector(this);

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

        //deselect connector
        this.subscribe({
            event: "ConnectorSelected",
            method: function(event) {
                if(this.htmlId !== event.id && this.isSelected) {
                    this.select(false);
                }
            }
        });
    },

    /**
     * selects the connector
     * @param select boolean
     * @param event mouse event
     */
    select: function(select, event) {
        console.debug("selected:" + this.htmlId);
        select = select || !this.isSelected;
        this.isSelected = select;

        if(select) {
            //select points
            this.p0.select(true);
            this.p1.select(true);
            this.p2.select(true);
            this.p3.select(true);

            //select lines
            this.l0.select(true);
            this.l1.select(true);
            this.l2.select(true);

            //throw event
            dojo.publish("ConnectorSelected", [{
                id: this.htmlId
            }]);

            //open context menu
            if(this.menu && event)
                this.menu.open(event.clientX, event.clientY);
        }

        //deselect connector
        else {
            //deselect points
            this.p0.select(false);
            this.p1.select(false);
            this.p2.select(false);
            this.p3.select(false);

            //deselect lines
            this.l0.select(false);
            this.l1.select(false);
            this.l2.select(false);
        }
    },

    /**
     * hovers connector
     * @param hover boolean
     */
    hover: function(hover) {
        hover = hover || !this.isHovered;
        this.isHovered = hover;

        if(hover) {
            //hover points
            this.p0.hover(true);
            this.p1.hover(true);
            this.p2.hover(true);
            this.p3.hover(true);

            //hover lines
            this.l0.hover(true);
            this.l1.hover(true);
            this.l2.hover(true);
        }

        else {
            //reset points
            this.p0.hover(false);
            this.p1.hover(false);
            this.p2.hover(false);
            this.p3.hover(false);

            //reset lines
            this.l0.hover(false);
            this.l1.hover(false);
            this.l2.hover(false);
        }
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
                readDir: "p0",
                x: p1x,
                y: p1y,
                onClick: dojo.hitch(this, function(event) {
                    this.select(true, event);
                }),
                onMouseOver: dojo.hitch(this, function() {
                    this.hover(true);
                }),
                onMouseOut: dojo.hitch(this, function() {
                    this.hover(false);
                })
            });

            this.p1.create();
        }

        //set position of p2 if already exists
        if(this.p2) this.p2.setPosition(p2x, p2y);

        //otherwise create new point
        else {
            this.p2 = new ui.classDiagram.connector.Point({
                placeAt: this.placeAt,
                readDir: "p3",
                x: p2x,
                y: p2y,
                onClick: dojo.hitch(this, function(event) {
                    this.select(true, event);
                }),
                onMouseOver: dojo.hitch(this, function() {
                    this.hover(true);
                }),
                onMouseOut: dojo.hitch(this, function() {
                    this.hover(false);
                })
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
                dashed: this.isInterface,
                placeAt: this.placeAt,
                onClick: dojo.hitch(this, function(event) {
                    this.select(true, event);
                }),
                onMouseOver: dojo.hitch(this, function() {
                    this.hover(true);
                }),
                onMouseOut: dojo.hitch(this, function() {
                    this.hover(false);
                })
            });
            //place line
            this.l0.create();
        }

        if(this.l1) this.l1.update(this.p1, this.p2);
        else {
            //create new line
            this.l1 = ui.classDiagram.connector.Line({
                dashed: this.isInterface,
                placeAt: this.placeAt,
                onClick: dojo.hitch(this, function(event) {
                    this.select(true, event);
                }),
                onMouseOver: dojo.hitch(this, function() {
                    this.hover(true);
                }),
                onMouseOut: dojo.hitch(this, function() {
                    this.hover(false);
                })
            });
            //place line
            this.l1.create();
        }

        if(this.l2) this.l2.update(this.p2, this.p3);
        else {
            //create new line
            this.l2 = ui.classDiagram.connector.Line({
                dashed: this.isInterface,
                placeAt: this.placeAt,
                onClick: dojo.hitch(this, function(event) {
                    this.select(true, event);
                }),
                onMouseOver: dojo.hitch(this, function() {
                    this.hover(true);
                }),
                onMouseOut: dojo.hitch(this, function() {
                    this.hover(false);
                })
            });
            //place line
            this.l2.create();
        }
    }
});

dojo.declare("ui.classDiagram.Generalization", ui.classDiagram.Connector, {
    editDialog: null,
    
    constructor: function(args) {
        args = args || {};
        this.type = "Generalization";
    },

    create: function() {
        this.inherited(arguments);

        //update positions
        this.update();

        //create context menu
        this.menu = new ui.ContextMenu({
            title: this.isInterface ? "Provided Interface" : "Generalization",
            buttons: [
                {
                    title: "Edit",
                    onClick: dojo.hitch(this, function() {
                        //edit generalization
                        if(!this.isInterface) {
                            //open dialog
                            if(!this.editDialog) {
                                this.editDialog = new ui.dialog.AddGeneralization({
                                    title: "Edit Generalization",
                                    diagram: this.diagram,
                                    connector: this,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.editDialog = null;
                                    })
                                });

                                this.editDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.editDialog.select(true);
                            }
                        }

                        //edit required interface
                        else {
                            //open dialog
                            if(!this.editDialog) {
                                this.editDialog = new ui.dialog.AddProvidedInterface({
                                    title: "Edit Provided Interface",
                                    diagram: this.diagram,
                                    connector: this,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.editDialog = null;
                                    })
                                });

                                this.editDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.editDialog.select(true);
                            }
                        }
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function() {
                        this.destroy(true);
                    })
                }
            ]
        });

        this.menu.create();

        //register to each connector element
        this.menu.register([
            this.p0.htmlId,
            this.p1.htmlId,
            this.p2.htmlId,
            this.p3.htmlId,
            this.l0.htmlId,
            this.l1.htmlId,
            this.l2.htmlId
        ])
    }
});

dojo.declare("ui.classDiagram.Association", ui.classDiagram.Connector, {
    editDialog: null,
    name: null,
    p0Role: null,
    p0RoleVisibility: null,
    p0Multiplicity: null,
    p3Role: null,
    p3RoleVisibility: null,
    p3Multiplicity: null,

    /**
     * args: {
     *   diagram: ui.content.ClassDiagram,
     *   placeAt: string
     *   name: string association name,
     *   p0Role: string,
     *   p0RoleVisibility: string,
     *   p0Multiplicity: string,
     *   p1Role: string,
     *   p1RoleVisibility: string,
     *   p1Multiplicity: string
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.name = args.name;
        this.type = "Association";
        this.p0Role = args.p0Role;
        this.p0RoleVisibility = args.p0RoleVisibility;
        this.p0Multiplicity = args.p0Multiplicity;
        this.p3Role = args.p1Role;
        this.p3RoleVisibility = args.p1RoleVisibility;
        this.p3Multiplicity = args.p1Multiplicity;
    },

    create: function() {
        this.inherited(arguments);

        //update positions
        this.update();

        //setup association
        if(this.name && this.name != "") this.l1.setName(this.name);

        if(!this.p0RoleVisibility || this.p0RoleVisibility == "") {
            this.p0RoleVisibility = "package";
        }

        if(this.p0Role && this.p0Role != "") {
            this.p0.setAssociationRole(this.p0Role, this.p0RoleVisibility);
        }

        if(this.p0Multiplicity && this.p0Multiplicity != "") {
            this.p0.setMultiplicity(this.p0Multiplicity);
        }

        if(!this.p3RoleVisibility || this.p3RoleVisibility == "") {
            this.p3RoleVisibility = "package";
        }

        if(this.p3Role && this.p3Role != "") {
            this.p3.setAssociationRole(this.p3Role, this.p3RoleVisibility);
        }

        if(this.p3Multiplicity && this.p3Multiplicity != "") {
            this.p3.setMultiplicity(this.p3Multiplicity);
        }

        //create context menu
        this.menu = new ui.ContextMenu({
            title: this.isInterface ? "Required Interface" : "Association",
            buttons: [
                {
                    title: "Edit",
                    onClick: dojo.hitch(this, function() {
                        //edit association
                        if(!this.isInterface) {
                            //open dialog
                            if(!this.editDialog) {
                                this.editDialog = new ui.dialog.AddAssociation({
                                    title: "Edit Association",
                                    diagram: this.diagram,
                                    connector: this,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.editDialog = null;
                                    })
                                });

                                this.editDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.editDialog.select(true);
                            }
                        }

                        //edit required interface
                        else {
                            //open dialog
                            if(!this.editDialog) {
                                this.editDialog = new ui.dialog.AddRequiredInterface({
                                    title: "Edit Required Interface",
                                    diagram: this.diagram,
                                    connector: this,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.editDialog = null;
                                    })
                                });

                                this.editDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.editDialog.select(true);
                            }
                        }
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function() {
                        this.destroy(true);
                    })
                }
            ]
        });

        this.menu.create();

        //register to each connector element
        this.menu.register([
            this.p0.htmlId,
            this.p1.htmlId,
            this.p2.htmlId,
            this.p3.htmlId,
            this.l0.htmlId,
            this.l1.htmlId,
            this.l2.htmlId
        ])
    }
});

dojo.declare("ui.classDiagram.ConnectorLabel", ui.Object, {
    startTag: null,
    startTagId: null,
    startTagMenu: null,
    startTagMenuStructure: null,
    endTag: null,
    endTagId: null,
    endTagMenu: null,
    endTagMenuStructure: null,
    isRotated: null,
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
        this.startTag = args.startTag;
        this.endTag = args.endTag;
    },

    create: function() {
        this.inherited(arguments);

        //create ids
        this.labelId = this.htmlId + "Label";
        this.inputId = this.htmlId + "Input";
        this.startTagId = this.htmlId + "StartTag";
        this.endTagId = this.htmlId + "EndTag";

        dojo.place(
            '<div class="ConnectorLabel" id="' + this.htmlId + '">' +
                '<div class="label" style="display: none;" id="' + this.startTagId + '"></div>' +
                '<div class="label" id="' + this.labelId + '"></div>' +
                '<input class="input" style="display: none;" id="' + this.inputId + '" />' +
                '<div class="label" style="display: none;" id="' + this.endTagId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //setup properties
        this.setStartTag(this.startTag);
        this.setLabel(this.label);
        this.update();

        //create a new context menu
        if(this.menuStructure && !this.menu) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.labelId]);

            //accept new input
            this.connect({
                event: "onkeyup",
                body: true,
                method: function(event) {
                    //13 = enter key
                    if(this.isSelected && event.keyCode == 13) {
                        this.setLabel(event.target.value);
                        this.select(false);
                    }

                    //set label size
                    if(event.target.value.length > 0) {
                        dojo.attr(event.target, "size", event.target.value.length);
                    }
                }
            });
        }
    },

    /**
     * destroys label
     * @param del
     */
    destroy: function(del) {
        if(this.startTagMenu) this.startTagMenu.destroy(true);
        if(this.endTagMenu) this.endTagMenu.destroy(true);
        if(this.menu) this.menu.destroy(true);

        this.inherited(arguments);
    },

    /**
     * updates the position
     */
    update: function() {
        var posX, posY;

        //get node properties
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
            posX = this.parent.x - origin.x;
            posY = this.parent.y - origin.y;

            //horizontal
            if(this.parent.side === 0) {
                this.setVertical(false);
                posX += this.parent.width/2;

                if(this.side == "above") {
                    posY -= (origin.y + 5 + this.offsetY);
                } else if(this.side == "below") {
                    posY += (origin.y + 5 + this.offsetY);
                }
            }

            //vertical
            else if(this.parent.side === 1) {
                this.setVertical(true);
                posY += this.parent.height/2;

                if(this.side == "above") {
                    posX += (origin.y + this.offsetX);
                } else if(this.side == "below") {
                    posX -= (origin.y + this.offsetX);
                }
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
     * sets the start tag
     * @param tag
     */
    setStartTag: function(tag, isIcon) {
        var node = dojo.byId(this.startTagId);
        this.startTag = tag || this.startTag || "";

        //show start tag
        if(tag) {
            if(!isIcon) node.innerHTML = this.startTag;

            //set icon
            else {
                //remove old icon
                dojo.empty(node);
                //set new icon
                dojo.place('<div class="icon ' + tag + '"></div>', node);
            }

            //show tag
            this.show(0, this.startTagId);

            //create startTag menu
            this.setStartTagMenu(true);
        }

        //otherwise hide start tag
        else {
            //unset start tag menu
            this.setStartTagMenu(false);
            this.hide(0, this.startTagId);
        }
    },

    /**
     * sets the end tag
     * @param tag
     */
    setEndTag: function(tag, isIcon) {
        var node = dojo.byId(this.endTagId);
        this.endTag = tag || this.endTag || "";

        //show end tag
        if(tag) {
            if(!isIcon) node.innerHTML = this.endTag;

            //set icon
            else {
                //remove old icon
                dojo.empty(node);
                //set new icon
                dojo.place('<div class="icon ' + tag + '"></div>', node);
            }

            //show tag
            this.show(0, this.endTagId);

            //create startTag menu
            this.setEndTagMenu(true);
        }

        //otherwise hide end tag
        else {
            //unset start tag menu
            this.setEndTagMenu(false);
            this.hide(0, this.endTagId);
        }
    },

    /**
     * sets and creates the context menu for the start tag
     */
    setStartTagMenu: function(enable) {
        //create menu
        if(enable && !this.startTagMenu && this.startTagMenuStructure) {
            this.startTagMenu = new ui.ContextMenu(
                this.startTagMenuStructure
            );

            this.startTagMenu.create();
            this.startTagMenu.register([this.startTagId]);
        }

        //if already exists activate it
        else if(enable && this.startTagMenu) this.startTagMenu.activate();

        //deactivate start tag menu
        else if(!enable && this.startTagMenu) this.startTagMenu.deactivate();
    },

    /**
     * sets and creates the context menu for the end tag
     */
    setEndTagMenu: function(enable) {
        //create menu
        if(enable && !this.endTagMenu && this.endTagMenuStructure) {
            this.endTagMenu = new ui.ContextMenu(
                this.endTagMenuStructure
            );

            this.endTagMenu.create();
            this.endTagMenu.register([this.endTagId]);
        }

        //if already exists activate it
        else if(enable && this.endTagMenu) this.endTagMenu.activate();

        //deactivate end tag menu
        else if(!enable && this.endTagMenu) this.endTagMenu.deactivate();
    },

    /**
     * rotates tag about 90 degrees
     * @param rot boolean
     */
    setVertical: function(rot) {
        this.isRotated = rot || false;
        if(rot) dojo.addClass(this.htmlId, "rotated");
        else dojo.removeClass(this.htmlId, "rotated");
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

            //set input size
            var length = input.value.length;
            if(length <= 0) length = 1;
            dojo.attr(input, "size", length);

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

dojo.declare("ui.classDiagram.AssociationRole", ui.classDiagram.ConnectorLabel, {
    /**
     * args: {
     *  role: string,
     *  visibility: string,
     *  placeAt
     *  }
     * @param args
     */
    constructor: function(args) {
        this.label = args.role;
        this.startTag = args.visibility;
    },

    /**
     * creates the association role
     */
    create: function() {
        this.menuStructure = {
            title: "Role",
            buttons: [
            {
                title: "Rename",
                onClick: dojo.hitch(this, function() {
                    this.select(true);
                })
            },
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.deactivate();
                })
            },
            {
                title: "Visibility",
                menu: {
                    title: "Set Visibility",
                    buttons: [
                    {
                        title: "public",
                        onClick: dojo.hitch(this, function() {
                            this.setStartTag("public");
                        })
                    },
                    {
                        title: "protected",
                        onClick: dojo.hitch(this, function() {
                            this.setStartTag("protected");
                        })
                    },
                    {
                        title: "private",
                        onClick: dojo.hitch(this, function() {
                            this.setStartTag("private");
                        })
                    },
                    {
                        title: "package",
                        onClick: dojo.hitch(this, function() {
                            this.setStartTag("package");
                        })
                    }
                    ]
                }
            }
            ]
        };

        //create menu structure
        this.startTagMenuStructure = {
            title: "Visibility",
            buttons: [
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.setStartTag();
                })
            },
            {
                title: "public",
                onClick: dojo.hitch(this, function() {
                    this.setStartTag("public");
                })
            },
            {
                title: "protected",
                onClick: dojo.hitch(this, function() {
                    this.setStartTag("protected");
                })
            },
            {
                title: "private",
                onClick: dojo.hitch(this, function() {
                    this.setStartTag("private");
                })
            },
            {
                title: "package",
                onClick: dojo.hitch(this, function() {
                    this.setStartTag("package");
                })
            }
            ]
        };

        //create label
        this.inherited(arguments);
    },

    /**
     * sets the visibility
     * @param tag string visibility "public", "private", "protected" or "package"
     */
    setStartTag: function(tag) {
        if(tag == "public") tag = "+";
        else if(tag == "protected") tag = "#";
        else if(tag == "private") tag = "-";
        else if(tag == "package") tag = "~";
        else tag = "+";

        //execute superclass method
        this.inherited(arguments);
    }
});

dojo.declare("ui.classDiagram.ConMultiplicity", ui.classDiagram.ConnectorLabel, {
    /**
     * args: {
     *  role: string,
     *  visibility: string,
     *  placeAt
     *  }
     * @param args
     */
    constructor: function(args) {
        this.label = args.multiplicity;
    },

    /**
     * creates the association role
     */
    create: function() {
        this.menuStructure = {
            title: "Role",
            buttons: [
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.deactivate();
                })
            },
            {
                title: "Edit",
                onClick: dojo.hitch(this, function() {
                    this.select(true);
                })
            },
            {
                title: "1",
                onClick: dojo.hitch(this, function() {
                    this.setLabel("1");
                })
            },
            {
                title: "0..*",
                onClick: dojo.hitch(this, function() {
                    this.setLabel("0..*");
                })
            }
            ]
        };

        //create label
        this.inherited(arguments);
    }
});

dojo.declare("ui.classDiagram.AssociationName", ui.classDiagram.ConnectorLabel, {
    /**
     * args: {
     *  name: string,
     *  direction: string,
     *  placeAt
     *  }
     * @param args
     */
    constructor: function(args) {
        this.label = args.name;
    },

    /**
     * creates the association role
     */
    create: function() {
        this.menuStructure = {
            title: "Name",
            buttons: [
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.deactivate();
                })
            },
            {
                title: "Rename",
                onClick: dojo.hitch(this, function() {
                    this.select(true);
                })
            }
            ]
        };

        //create label
        this.inherited(arguments);

        //this.setStartTag("readDirectionWest", true);
        //this.setEndTag("readDirectionEast", true);
    },

    /**
     * sets the read direction
     * @param pointName string "p0" or "p3"
     */
    setReadDirection: function(pointName) {
        //get read directions of each line point
        var lineP0Dir = this.parent.p0.readDir;
        var lineP1Dir = this.parent.p3.readDir;
        //TODO implement
    }
});