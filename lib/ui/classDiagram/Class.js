/**
 * User: Christoph Grundmann
 * Date: 21.06.11
 * Time: 16:42
 *
 */
dojo.provide("ui.classDiagram.Class");
dojo.require("ui.ContextMenu");
dojo.require("ui.Language");
dojo.require("ui.dialog.AddOperation");
dojo.require("ui.dialog.AddAttribute");
dojo.require("ui.dialog.AddParameter");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.Class", ui.Object, {
    MOVE_EVENT: null,
    
    toolbarIsVisible: null,
    language: null,
    dnd: null,
    diagram: null,
    nameInput: null,
    isSelected: null,
    error: null,
    x: null,
    y: null,

    //class properties
    _imports: null,
    _package: null,
    attributes: null,
    operations: null,
    isAbstract: null,
    stereotype: null,
    visibility: null,
    modifier: null,
    connectors: null,
    name: null,

    //dialogs
    editDialog: null,
    addOperationDialog: null,
    addAttributeDialog: null,

    //context menus
    stereotypeMenu: null,

    //ids
    nameId: null,
    bodyId: null,
    titleId: null,
    toolsId: null,
    innerId: null,
    abstractId: null,
    stereotypeId: null,
    attributesId: null,
    operationsId: null,
    addAttributeBtnId: null,
    addOperationBtnId: null,

    /**
     * initializes a new class
     * args: {
     *   _imports: array,
     *   _package: string,
     *   stereotype: string,
     *   diagram: ui.content.ClassDiagram
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.x = args.x;
        this.y = args.y;
        this.name = args.name;
        this.stereotype = args.stereotype;
        this.isAbstract = args.isAbstract;
        this.attributes = args.attributes || {};
        this.operations = args.operations || {};
        this._imports = args._imports;
        this._package = args._package;
        this.diagram = args.diagram;
        this.language = new ui.Language();
        this.uiType = "class";
        this.error = [];
    },

    /**
     * creates and places a new class
     */
    create: function() {
        this.inherited(arguments);

        //set class global
        this.setGlobal(this.uiType);

        //create ids
        this.nameId = this.htmlId + "Name";
        this.bodyId = this.htmlId + "Body";
        this.toolsId = this.htmlId + "Tools";
        this.titleId = this.htmlId + "Title";
        this.innerId = this.htmlId + "Inner";
        this.abstractId = this.htmlId + "Abstract";
        this.stereotypeId = this.htmlId + "Stereotype";
        this.attributesId = this.htmlId + "Attributes";
        this.operationsId = this.htmlId + "Operations";
        this.addAttributeBtnId = this.htmlId + "AddAttributeBtn";
        this.addOperationBtnId = this.htmlId + "AddOperationBtn";

        //test ids
        this.dragIconId = this.htmlId + "DragIcon";
        this.pinIconId = this.htmlId + "PinIcon";

        //create event names
        this.MOVE_EVENT = "_pos_" + this.htmlId;

        //place class into dom
        dojo.place(
            '<div class="Class" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="inner" id="' + this.innerId + '">' +
                    '<div class="toolbar" style="display: none;" id="' + this.toolsId + '">' +
                        '<div class="icon drag" id="' + this.dragIconId + '"></div>' +
                        //'<div class="icon pin" id="' + this.pinIconId + '"></div>' +
                    '</div>' +
                    '<div class="title" id="' + this.titleId + '">' +
                        '<div class="stereotype" id="' + this.stereotypeId + '"></div>' +
                        '<div class="name" id="' + this.nameId + '"></div>' +
                        '<div class="abstract" id="' + this.abstractId + '"></div>' +
                    '</div>' +
                    '<div class="body" id="' + this.innerId + '">' +
                        '<div class="bodyHeader">' +
                            '<div class="bodyTitle">' + this.language.ADD_ATTRIBUTE_BTN + '</div>' +
                            '<div class="button" id="' + this.addAttributeBtnId + '"></div>' +
                        '</div>' +
                        '<div class="attributes" id="' + this.attributesId + '"></div>' +
                        '<div class="bodyHeader">' +
                            '<div class="bodyTitle">' + this.language.ADD_OPERATION_BTN + '</div>' +
                            '<div class="button" id="' + this.addOperationBtnId + '"></div>' +
                        '</div>' +
                        '<div class="operations" id="' + this.operationsId + '"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //create name input
        this.nameInput = new ui.classDiagram.ClassName({
            placeAt: this.nameId,
            name: this.name,
            component: this,
            onValueChange: dojo.hitch(this, function(name) {
                this.name = name;
            })
        });

        this.nameInput.create();

        //configure class
        this.setPosition(this.x, this.y);
        this.setAbstract(this.isAbstract);
        this.setStereotype(this.stereotype);
        //this.setName(this.name);

        //make class moveable
        this.dnd = new dojo.dnd.Moveable(this.htmlId, {
            handle: this.dragIconId
        });

        //select class on first move
        this.dnd.onFirstMove = dojo.hitch(this, function() {
            this.select(true);
        });

        //throw class specific move event
        this.dnd.onMoved = dojo.hitch(this, function(mover, leftTop) {
            this.x = leftTop.l;
            this.y = leftTop.t;
            dojo.publish(this.MOVE_EVENT);
        });

        //create context menus
        this.createStereotypeMenu();
        this.createAbstractMenu();

        //select class
        this.connect({
            name: "Select",
            nodeId: this.htmlId,
            event: "onclick",
            method: function(event) {
                this.select(true);
            }
        });

        //move class
        this.connect({
            name: "Keyboard",
            body: true,
            event: "onkeypress",
            method: function(event) {
                if(this.isSelected && event.ctrlKey) {
                    var moveStep = 3;
                    //left arrow - 37
                    if(event.keyCode == 37) {
                        dojo.stopEvent(event);
                        this.setPosition(this.x - moveStep, this.y);
                    }
                    //up arrow - 38
                    else if(event.keyCode == 38) {
                        dojo.stopEvent(event);
                        this.setPosition(this.x, this.y - moveStep);
                    }
                    //right arrow - 39
                    else if(event.keyCode == 39) {
                        dojo.stopEvent(event);
                        this.setPosition(this.x + moveStep, this.y);
                    }
                    //down arrow - 40
                    else if(event.keyCode == 40) {
                        dojo.stopEvent(event);
                        this.setPosition(this.x, this.y + moveStep);
                    }
                }
            }
        });

        //stop event bubbling
        this.connect({
            name: "StopMoving",
            nodeId: this.htmlId,
            event: "onmousedown",
            method: function(event) {
                //stop event bubbling, so the
                //scrollable background won't move
                //on mouse actions on class focus
                dojo.stopEvent(event);
            }
        });

        //deselect if another class is selected
        this.subscribe({
            event: "ClassSelected",
            method: function(id) {
                if(this.htmlId != id) {
                    this.select(false);
                }
            }
        });

        //deselect dialog
        this.connect({
            name: "DeselectClass",
            event: "onclick",
            body: true,
            method: function(event) {
                if(this.isSelected && !this.isUiType(event.target)) {
                    this.select(false);
                }
            }
        });

        //show toolbar on hover
        this.connect({
            nodeId: this.htmlId,
            event: "onmouseover",
            method: function(event) {
                this.showToolbar();
            }
        });

        //hide toolbar on mouse out
        this.connect({
            nodeId: this.htmlId,
            event: "onmouseout",
            method: function(event) {
                if(!this.isSelected) {
                    this.hideToolbar();
                }
            }
        });

        //register add operation btn
        this.connect({
            name: "AddOperation",
            nodeId: this.addOperationBtnId,
            event: "onclick",
            method: function(event) {
                dojo.stopEvent(event);
                if(!this.addOperationDialog) {
                    //if dialog doesn't exists create a new one
                    this.addOperationDialog = new ui.dialog.AddOperation({
                        title: "Add Operation (" + this.name + ")",
                        parentClass: this,
                        onSelect: dojo.hitch(this, function() {
                            this.select(true);
                        }),
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.addOperationDialog = null;
                        })
                    });

                    this.addOperationDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.addOperationDialog.select(true);
                }
            }
        });

        //register add operation btn
        this.connect({
            name: "AddAttribute",
            nodeId: this.addAttributeBtnId,
            event: "onclick",
            method: function(event) {
                dojo.stopEvent(event);
                if(!this.addAttributeDialog) {
                    //if dialog doesn't exists create a new one
                    this.addAttributeDialog = new ui.dialog.AddAttribute({
                        title: "Add Attribute (" + this.name + ")",
                        parentClass: this,
                        onSelect: dojo.hitch(this, function() {
                            this.select(true);
                        }),
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.addAttributeDialog = null;
                        })
                    });

                    this.addAttributeDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.addAttributeDialog.select(true);
                }
            }
        });

        /*
        this.connect({
            name: "DEBUG",
            nodeId: this.htmlId,
            event: "onmouseover",
            method: function() {
                console.debug(this.getJSON());
            }
        });*/
    },

    /**
     * destroys the class
     */
    destroy: function() {
        //destroy name input
        if(this.nameInput) this.nameInput.destroy(true);

        //destroy menus
        if(this.stereotypeMenu) {
            this.stereotypeMenu.destroy(true);
        }
        if(this.abstractMenu) {
            this.abstractMenu.destroy(true);
        }

        //destroy oprations/attributes
        for(var id in this.operations) {
            this.operations[id].destroy(true);
        }

        for(var id in this.attributes) {
            this.attributes[id].destroy(true);
        }

        //destroy dialogs
        if(this.addAttributeDialog) this.addAttributeDialog.close();
        if(this.addOperationDialog) this.addOperationDialog.close();
        if(this.editDialog) this.editDialog.close();

        //destroy connectors
        if(this.connectors) for(var id in this.connectors) {
            this.connectors[id].destroy(true);
        }

        //remove from diagram storage
        this.diagram.removeClass(this.name);

        this.inherited(arguments);
    },

    /**
     * gets each information about
     * the class as JSON object
     */
    getJSON: function() {
        //create javadoc info
        var javaDoc = {
            "umlPos": [
                {
                    "tag": "umlPos",
                    "x": this.x,
                    "y": this.y
                }
            ]
        };

        return {
            "package": this._package || null,
            "imports": this._imports || [],
            "classes": [
                {
                    "type": this.stereotype || "class",
                    "javaDoc": javaDoc,
                    "visibility": this.visibility || null,
                    "modifier": this.modifier ? this.modifier.split(" ") : [],
                    "name": this.name,
                    "extend": this.getSuperClass(),
                    "implement": this.getInterfaces(),
                    "body": {
                        "variable": this.getAttributes(),
                        "method": this.getOperations()
                    }
                }
            ]
        }
    },

    /**
     * activates class
     */
    activate: function() {
        for(var id in this.operations) {
            this.operations[id].activate();
        }

        for(var id in this.attributes) {
            this.attributes[id].deactivate();
        }

        this.inherited(arguments);
    },

    /**
     * deactivates class
     */
    deactivate: function() {
        for(var id in this.operations) {
            this.operations[id].deactivate();
        }

        for(var id in this.attributes) {
            this.attributes[id].deactivate();
        }

        this.inherited(arguments);
    },

    /**
     * sets the position
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;

        var node = dojo.byId(this.htmlId);
        dojo.style(node, "left", x + "px");
        dojo.style(node, "top", y + "px");

        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * gets the position range for the given point
     * and calculates a possible position for the point
     *
     * returns {
     *   side: "left",
     *   x: integer,
     *   y: integer,
     *   range: {
     *      x0: integer,
     *      y0: integer,
     *      x1: integer,
     *      y1: integer
     *   }
     * }
     *
     * @param point ui.classDiagram.connector.Point
     * @return object
     */
    getConnectRange: function(point) {
        //var size = dojo.position(this.htmlId, true);
        var node = dojo.byId(this.htmlId);
        var size = {
            x: dojo.style(node, "left"),
            y: dojo.style(node, "top"),
            w: dojo.style(node, "width"),
            h: dojo.style(node, "height")
        }
        var side = point.connectSide;
        var x0, y0, x1, y1;
        var x, y;

        if(side == "top") {
            //calculate position
            //TODO calculate offset as percentual value
            x = size.x + point.offset;
            y = size.y - dojo.style(point.htmlId, "height"); //dojo.position(point.htmlId, true).h;
        } else if(side == "right") {
            //calculate position
            x = size.x + size.w;
            y = size.y + point.offset;
        } else if(side == "bottom") {
            //calculate position
            x = size.x + point.offset;
            y = size.y + size.h;
        } else if(side == "left") {
            //calculate position
            x = size.x - dojo.style(point.htmlId, "width"); //dojo.position(point.htmlId, true).w;
            y = size.y + point.offset;
        }

        //calculate range
        if(side == "right" || side == "left") {
            x0 = x;
            y0 = size.y;
            x1 = x;
            y1 = size.y + size.h;
        } else {
            x0 = size.x;
            y0 = y;
            x1 = size.x + size.w;
            y1 = y;
        }

        return {
            side: side,
            x: x,
            y: y,
            range: {
               x0: x0,
               y0: y0,
               x1: x1,
               y1: y1
            }
        }
    },

    /**
     * registers a connector
     * @param ui.classDiagram.Connector
     */
    registerConnector: function(connector) {
        if(!this.connectors) this.connectors = {};
        this.connectors[connector.htmlId] = connector;
    },

    /**
     * removes a specific connector by id
     * @param id string htmlId
     */
    removeConnector: function(id) {
        if(this.connectors && this.connectors[id]) {
            delete this.connectors[id];
        }
    },

    /**
     * selects or deselects the class
     * @param select boolean if it is set to false class will be deactivated
     */
    select: function(select) {
        //get class node
        var node = dojo.byId(this.htmlId);

        //select class
        if(select) {
            this.isSelected = true;
            this.showToolbar();
            dojo.addClass(node, "selected");
            dojo.style(node, "zIndex", 100);
            dojo.publish("ClassSelected", [this.htmlId]);
        }

        //deselect class
        else {
            this.hideToolbar();
            dojo.removeClass(node, "selected");
            dojo.style(node, "zIndex", 50);
            this.isSelected = false;
        }
    },

    /**
     * shows the toolbar
     */
    showToolbar: function() {
        //TODO don't use a hard coded value like 29
        if(!this.toolbarIsVisible) {
            this.setPosition(this.x, this.y - 27);
            this.toolbarIsVisible = true;
        }

        //get toolbar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show toolbar
        if(toolBarNode) dojo.style(toolBarNode, "display", "");
        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * hides the toolbar
     */
    hideToolbar: function() {
        //TODO don't use a hard coded value like 29
        if(this.toolbarIsVisible) {
            this.setPosition(this.x, this.y + 27);
            this.toolbarIsVisible = false;
        }
        
        //get tool bar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show tool bar
        if(toolBarNode) dojo.style(toolBarNode, "display", "none");
        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * creates context menu for the
     * stereotype option
     */
    createStereotypeMenu: function() {
        this.stereotypeMenu = new ui.ContextMenu({
            title: "Stereotypes",
            buttons: [
            {
                title: "none",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype();
                })
            },
            {
                title: "interface",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("interface");
                })
            },
            {
                title: "enumeration",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("enumeration");
                })
            }
            ]
        });

        this.stereotypeMenu.create();
        this.stereotypeMenu.register([this.stereotypeId]);
    },

    /**
     * creates context menu for the
     * stereotype option
     */
    createAbstractMenu: function() {
        this.abstractMenu = new ui.ContextMenu({
            title: "Abstract",
            buttons: [
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.setAbstract(false);
                })
            }
            ]
        });

        this.abstractMenu.create();
        this.abstractMenu.register([this.abstractId]);
    },

    /**
     * sets the abstract tag
     * @param enable boolean activates or disables the abstract tag
     */
    setAbstract: function(enable) {
        var abstractNode = dojo.byId(this.abstractId);
        this.isAbstract = enable || false;

        if(this.isAbstract && abstractNode) {
            //enables abstract tag
            dojo.style(abstractNode, "display", "");
            abstractNode.innerHTML = "{abstract}";
        } else if(abstractNode) {
            //disables abstract tag
            dojo.style(abstractNode, "display", "none");
        }
    },

    /**
     * sets a stereotype or removes the current one
     * @param type string stereotype
     */
    setStereotype: function(type) {
        var stereotypeNode = dojo.byId(this.stereotypeId);
        this.stereotype = type;

        if(this.stereotype && stereotypeNode) {
            //set new stereotype
            dojo.style(stereotypeNode, "display", "");
            stereotypeNode.innerHTML = "&lt;&lt;" + this.stereotype + "&gt;&gt;";
        } else if(stereotypeNode) {
            //hide stereotype node
            dojo.style(stereotypeNode, "display", "none");
        }
    },

    /**
     * sets the classname
     * @param name string
     */
    setName: function(name) {
        this.nameInput.setValue(name);
        this.name = name || "unnamed";
    },

    /**
     * creates a new operation and
     * add it into the operation list
     */
    addOperation: function(properties) {
        var operation = new ui.classDiagram.Operation({
            placeAt: this.operationsId,
            isConstructor: properties.isConstructor,
            visibility: properties.visibility,
            name: properties.name,
            body: properties.body,
            parameter: properties.parameter,
            returnType: properties.returnType,
            property: properties.property,
            modifier: properties.modifier
        });

        if(!this.operations) this.operations = {};
        //TODO remove if already exists
        this.operations[operation.htmlId] = operation;

        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * creates a new attribute and
     * add it into the attribute list
     */
    addAttribute: function(properties) {
        var attribute = new ui.classDiagram.Attribute({
            placeAt: this.attributesId,
            visibility: properties.visibility,
            name: properties.name,
            dataType: properties.dataType,
            multiplicity: properties.multiplicity,
            defaultValue: properties.defaultValue,
            property: properties.property,
            modifier: properties.modifier
        });

        if(!this.attributes) this.attributes = {};
        //TODO remove if already exists
        this.attributes[attribute.htmlId] = attribute;

        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * gets class operations
     */
    getOperations: function() {
        var ops = [];
        for(var id in this.operations) {
            ops.push(this.operations[id].getJSON());
        }

        return ops;
    },

    /**
     * gets class attributes
     */
    getAttributes: function() {
        var attr = [];
        for(var id in this.attributes) {
            attr.push(this.attributes[id].getJSON());
        }

        //create variables from associations
        for(var id in this.connectors) {
            var connector = this.connectors[id];
            var isAssociation = connector.type == "Association";
            var isInterfaceCon = connector.isInterface;
            var isP0Class = connector.p0Class.htmlId == this.htmlId;
            var isP3Class = connector.p3Class.htmlId == this.htmlId;
            var direction = connector.direction;

            //properties
            var _class = null;
            var _role = null;
            var _multiplicity = null;
            var _visibility = null;
            
            //get association relations
            if(isAssociation && !isInterfaceCon) {
                //get p3Class
                if(isP0Class && direction == "p1" || direction == "both") {
                    _class = connector.p0Class;
                    _role = connector.p0Role;
                    _multiplicity = connector.p0Multiplicity;
                    _visibility = connector.p0RoleVisibility;
                }

                //get p0Class
                else if(isP3Class && direction == "p0" || direction == "both") {
                    _class = connector.p3Class;
                    _role = connector.p3Role;
                    _multiplicity = connector.p3Multiplicity;
                    _visibility = connector.p3RoleVisibility;
                }
            }

            //get required interfaces
            else if(isAssociation && isInterfaceCon) {
                //get p3Class
                if(isP0Class && direction == "p1" || direction == "both") {
                    _class = connector.p3Class;
                    _role = connector.p3Role;
                    _multiplicity = connector.p3Multiplicity;
                    _visibility = connector.p3RoleVisibility;
                }

                //get p0Class
                else if(isP3Class && direction == "p0" || direction == "both") {
                    _class = connector.p0Class;
                    _role = connector.p0Role;
                    _multiplicity = connector.p0Multiplicity;
                    _visibility = connector.p0RoleVisibility;
                }
            }

            //create attribute and store it
            if(_class) {
                //get properties
                var name = _role || "_" + _class.name.toLowerCase();

                //check whether var is an array
                var isArray = false;
                var hasStarletSelector = (_multiplicity && _multiplicity.search(/\*/) != -1) ? true : false;
                //TODO allow 10, 100 or other, but 0 or 1
                var hasPointSelector = (_multiplicity && _multiplicity.search(/\.\.[2-9*]+/) != -1) ? true : false;
                if(_multiplicity === "1") {
                    isArray = false;
                } else if(hasStarletSelector || hasPointSelector) {
                    isArray = true;
                }

                //check whether the same variable already exists
                var exists = false;
                for(var id in this.attributes) {
                    var attribute = this.attributes[id];
                    var identicalDataType = attribute.dataType.getDataType() === _class.name;
                    var identicalName = attribute.name.value.toLowerCase() === (_role || _class.name).toLowerCase();
                    if(identicalDataType && identicalName) exists = true;
                }

                //create new attribute
                if(!exists) attr.push({
                    "type": "variable",
                    "javaDoc": null,
                    "name": name,
                    "visibility": _visibility != "package" ? _visibility : null,
                    "modifier": [],
                    "array": isArray,
                    "generic": null,
                    "dataType": _class.name,
                    "value": null
                });
            }
        }
        
        return attr;
    },

    /**
     * gets each implements interface
     */
    getInterfaces: function() {
        var interfaces = [];
        for(var id in this.connectors) {
            var connector = this.connectors[id];
            var isGeneralization = connector.type == "Generalization";
            var isInterfaceCon = connector.isInterface;
            var isSubclass = connector.p3Class.htmlId == this.htmlId;

            //select generalizations only
            if(isGeneralization && isInterfaceCon && isSubclass) {
                interfaces.push(connector.p0Class.name);
            }
        }

        return interfaces;
    },

    /**
     * gets super class
     */
    getSuperClass: function() {
        var superclass = null;
        for(var id in this.connectors) {
            var connector = this.connectors[id];
            var isGeneralization = connector.type == "Generalization";
            var isInterfaceCon = connector.isInterface;
            var isSubclass = connector.p3Class.htmlId == this.htmlId;
            var isInterface = this.stereotype == "interface";

            //extend interface
            if(isGeneralization && !isInterfaceCon && isSubclass && isInterface) {
                superclass = connector.p0Class.name;
                break;
            }

            //get superclass
            else if(isGeneralization && !isInterfaceCon && isSubclass && !isInterface) {
                superclass = connector.p0Class.name;
                break;
            }
        }

        return superclass;
    },

    /**
     * opens the edit dialog
     * to modify this class
     */
    edit: function() {
        if(!this.editDialog) {
            this.editDialog = new ui.dialog.AddClass({
                title: "Edit Class (" + this.name + ")",
                diagram: this.diagram,
                editableClass: this,
                onSelect: dojo.hitch(this, function() {
                    //this.select(true);
                }),
                onDestroy: dojo.hitch(this, function() {
                    //set instance var to null
                    this.editDialog = null;
                })
            });

            this.editDialog.create();
        } else {
            this.editDialog.select(true);
        }
    }
});

/**
 * implementation of an attribute
 * [Visibility] [/] Name [:DataType] [Multiplicity] [=DefaultValue] [{Property}]
 */
dojo.declare("ui.classDiagram.Attribute", ui.Object, {
    editDialog: null,

    //ids
    visibilityId: null,
    nameId: null,
    dataTypeId: null,
    multiplicityId: null,
    defaultValueId: null,
    propertyId: null,

    //attr properties
    modifier: null,
    isStatic: null,
    visibility: null,
    name: null,
    dataType: null,
    multiplicity: null,
    defaultValue: null,
    property: null,

    /**
     * initialize attribute
     * @param args
     */
    constructor: function(args) {
        args = args || {};

        //create and place operation entry
        this.create(args.name);

        //initialize properties
        this.setVisibility(args.visibility);
        this.setDataType(args.dataType);
        this.setMultiplicity(args.multiplicity);
        this.setDefaultValue(args.defaultValue);
        this.setProperty(args.property);
        this.setModifier(args.modifier);
    },

    /**
     * creates attribute
     * @param name string attribute name
     */
    create: function(name) {
        this.inherited(arguments);

        //create ids
        this.visibilityId = this.htmlId + "Visibility";
        this.nameId = this.htmlId + "Name";
        this.dataTypeId = this.htmlId + "DataType";
        this.multiplicityId = this.htmlId + "Multiplicity";
        this.defaultValueId = this.htmlId + "DefaultValue";
        this.propertyId = this.htmlId + "Property";

        //init attribute name
        this.name = new ui.classDiagram.Name({
            placeAt: this.nameId,
            type: "attribute",
            component: this,
            name: name
        });

        //place attribute
        dojo.place(
            '<div class="attribute" id="' + this.htmlId + '">' +
                '<div style="float: left;" id="' + this.visibilityId + '"></div>' +
                '<div style="float: left;" id="' + this.nameId + '"></div>' +
                '<div style="float: left;" id="' + this.dataTypeId + '"></div>' +
                '<div style="float: left;" id="' + this.multiplicityId + '"></div>' +
                '<div style="float: left;" id="' + this.defaultValueId + '"></div>' +
                '<div style="float: left;" id="' + this.propertyId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //create name
        this.name.create();

        /*
        //TODO remove
        this.connect({
            name: "DEBUG",
            nodeId: this.htmlId,
            event: "onmouseover",
            method: function() {
                console.debug(this.getJSON());
            }
        });*/
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        if(this.editDialog) this.editDialog.close();
        if(this.visibility) this.visibility.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        this.inherited(arguments);
    },

    /**
     * gets each information about
     * the attribute as JSON object
     */
    getJSON: function() {
        //TODO implement JavaDoc
        var javaDoc = null;

        //get modifier
        var modifier = this.modifier ? this.modifier.split(" ") : [];

        //checks whether param is an array
        var arrayPos = this.dataType.value ? this.dataType.value.search(/\[.*\]/) : -1;
        var isArray = (arrayPos != -1) ? true : false;

        //check multiplicity. it has a higher priority then the array declaration
        var hasStarletSelector = (this.multiplicity.value && this.multiplicity.value.search(/\*/) != -1) ? true : false;
        //TODO allow 10, 100 or other, but 0 or 1
        var hasPointSelector = (this.multiplicity.value && this.multiplicity.value.search(/\.\.[2-9*]+/) != -1) ? true : false;
        if(this.multiplicity.value === "1") {
            isArray = false;
        } else if(hasStarletSelector || hasPointSelector) {
            isArray = true;
        }

        //search for generic declarations
        var genericStartPos = this.dataType.value ? this.dataType.value.search(/<.+>/) : -1;
        var genericEndPos = this.dataType.value ? this.dataType.value.search(/>/) : -1;
        var generic = null;

        if(genericStartPos != -1) {
            generic = this.dataType.value.slice(genericStartPos+1, genericEndPos);
        }

        //get data type
        var dataType = this.dataType.value || "Object";
        if(genericStartPos != -1) {
            dataType = dataType.slice(0, genericStartPos);
        } else if(arrayPos != -1) {
            dataType = dataType.slice(0, arrayPos);
        }

        //get visibility
        var visibility = null;
        if(this.visibility.value == "+")
            visibility = "public";
        else if(this.visibility.value == "#")
            visibility = "protected";
        else if(this.visibility.value == "-")
            visibility = "private";

        return {
            "type": "variable",
            "javaDoc" : javaDoc,
            "visibility": visibility,
            "modifier": modifier,
            "dataType": dataType,
            "generic": generic,
            "array": isArray,
            "name": this.name.value,
            "value": this.defaultValue.value || null
        };
    },

    /**
     * sets the name
     */
    setName: function(value) {
        this.name.setValue(value);
    },

    /**
     * sets modifier and static
     * @param value
     */
    setModifier: function(value) {
        this.modifier = value;

        //set attribute as static
        var _isStatic = value ? value.search(/static/g) : -1;
        if(_isStatic !== -1) {
            this.isStatic = true;
            dojo.addClass(this.htmlId, "static");
        }
        //unset static property
        else {
            this.isStatic = false;
            dojo.removeClass(this.htmlId, "static");
        }
    },

    setVisibility: function(value) {
        //create a new visibility tag
        if(!this.visibility) {
            //init visibility
            this.visibility = new ui.classDiagram.Visibility({
                placeAt: this.visibilityId,
                visibility: value
            });

            //create tag
            this.visibility.create();
        }

        //otherwise activate the existing icon
        else {
            this.visibility.activate();
            this.visibility.setValue(value);
        }
    },

    setDataType: function(value) {
        //create return type tag
        if(!this.dataType) {
            //init return type
            this.dataType = new ui.classDiagram.ReturnType({
                placeAt: this.dataTypeId,
                dataType: value
            });

            //create tag
            this.dataType.create();
        }

        //otherwise activate existing tag
        else {
            this.dataType.activate();
            this.dataType.setValue(value);
        }
    },

    setMultiplicity: function(value) {
        //create multiplicity tag
        if(!this.multiplicity) {
            //init return type
            this.multiplicity = new ui.classDiagram.Multiplicity({
                placeAt: this.multiplicityId,
                multiplicity: value
            });

            //create tag
            this.multiplicity.create();
        }

        //otherwise activate existing tag
        else {
            this.multiplicity.activate();
            this.multiplicity.setValue(value);
        }
    },

    setDefaultValue: function(value) {
        //create return type tag
        if(!this.defaultValue) {
            //init return type
            this.defaultValue = new ui.classDiagram.DefaultValue({
                placeAt: this.defaultValueId,
                value: value
            });

            //create tag
            this.defaultValue.create();
        }

        //otherwise activate existing tag
        else {
            this.defaultValue.activate();
            this.defaultValue.setValue(value);
        }
    },

    setProperty: function(value) {
        //create property tag
        if(!this.property) {
            //init property
            this.property = new ui.classDiagram.Property({
                placeAt: this.propertyId,
                property: value
            });

            //create tag
            this.property.create();
        }

        //otherwise activate existing tag
        else {
            this.property.activate();
            this.property.setValue(value);
        }
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddAttribute({
                editableAttribute: this,
                title: "Edit Attribute (" + this.name.value + ")",
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
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
});

/**
 * implementation of an operation
 * [Visibility] Name ([ParameterList]) [:ReturnType] [{Property}]
 */
dojo.declare("ui.classDiagram.Operation", ui.Object, {
    addParameterDialog: null,
    editDialog: null,
    language: null,
    error: null,

    //properties
    isConstructor: null,
    visibility: null,
    parameterList: null,
    returnType: null,
    property: null,
    name: null,
    isStatic: null,
    isAbstract: null,
    modifier: null,
    body: null,

    //ids
    nameId: null,
    addBtnId: null,
    propertyId: null,
    returnTypeId: null,
    visibilityId: null,
    parameterListId: null,

    /**
     * initializes and creates operation
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
        this.error = [];

        //create and place operation entry
        this.create(args.name);

        //set up operation
        this.isConstructor = args.isConstructor;
        this.setVisibility(args.visibility);
        this.setReturnType(args.returnType);
        this.setProperty(args.property);
        this.setModifier(args.modifier);
        this.setBody(args.body);

        //adds new parameter if given
         if(args.parameter) this.addParameter(args.parameter);
    },

    /**
     * places and creates operation
     */
    create: function(name) {
        this.inherited(arguments);

        //create ids
        this.nameId = this.htmlId + "Name";
        this.addBtnId = this.htmlId + "AddBtn";
        this.propertyId = this.htmlId + "Property";
        this.returnTypeId = this.htmlId + "ReturnType";
        this.visibilityId = this.htmlId + "Visibility";
        this.parameterListId = this.htmlId + "ParameterList";

        //init operation name
        this.name = new ui.classDiagram.Name({
            placeAt: this.nameId,
            type: "operation",
            component: this,
            name: name
        });

        //place operation
        dojo.place(
            '<div class="operation" id="' + this.htmlId + '">' +
                '<div style="float: left;" id="' + this.visibilityId + '"></div>' +
                '<div style="float: left;" id="' + this.nameId + '"></div>' +
                '<div style="float: left; padding: 2px;">(</div>' +
                '<div style="float: left;" id="' + this.parameterListId + '">' +
                    '<div class="button noMargin" id="' + this.addBtnId + '"></div>' +
                '</div>' +
                '<div style="float: left; padding: 2px;">)</div>' +
                '<div style="float: left;" id="' + this.returnTypeId + '"></div>' +
                '<div style="float: left;" id="' + this.propertyId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //register add operation btn
        this.connect({
            name: "AddParameter",
            nodeId: this.addBtnId,
            event: "onclick",
            method: function(event) {
                dojo.stopEvent(event);
                if(!this.addParameterDialog) {
                    //if dialog doesn't exists create a new one
                    this.addParameterDialog = new ui.dialog.AddParameter({
                        title: "Add Parameter (" + this.name.value + ")",
                        parentOperation: this,
                        onSelect: dojo.hitch(this, function() {
                            //TODO select attribute
                            //this.select(true);
                        }),
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.addParameterDialog = null;
                        })
                    });

                    this.addParameterDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.addParameterDialog.select(true);
                }
            }
        });

        //create name
        this.name.create();

        /*
        //TODO remove
        this.connect({
            name: "DEBUG",
            nodeId: this.htmlId,
            event: "onmouseover",
            method: function() {
                console.debug(this.getJSON());
            }
        }); */
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        //destroy dialogs
        if(this.addParameterDialog) this.addParameterDialog.close();
        if(this.editDialog) this.editDialog.close();

        //destroy tags
        if(this.visibility) this.visibility.destroy(true);
        if(this.returnType) this.returnType.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        //destroy each parameter
        if(this.parameterList) for(var id in this.parameterList) {
            this.parameterList[id].destroy(true);
        } this.parameterList = null;

        this.inherited(arguments);
    },

    /**
     * sets the name
     * @param value
     */
    setName: function(value) {
        this.name.setValue(value);
    },

    /**
     * sets the methods body
     * @param body
     */
    setBody: function(body) {
        this.body = body;
    },

    /**
     * sets the modifier
     * @param value
     */
    setModifier: function(value) {
        this.modifier = value;

        //set operation as static
        var _isStatic = value ? value.search(/static/g) : -1;
        if(_isStatic !== -1) {
            this.isStatic = true;
            dojo.addClass(this.htmlId, "static");
        }
        //unset static property
        else {
            this.isStatic = false;
            dojo.removeClass(this.htmlId, "static");
        }

        //set operation abstract
        var _isAbstract = value ? value.search(/abstract/g) : -1;
        if(_isAbstract !== -1) {
            this.isAbstract = true;
            dojo.addClass(this.htmlId, "abstract");
        }
        //unset abstract property
        else {
            this.isAbstract = false;
            dojo.removeClass(this.htmlId, "abstract");
        }
    },

    /**
     * sets a visibility tag
     */
    setVisibility: function(value) {
        //create a new visibility tag
        if(!this.visibility) {
            //init visibility
            this.visibility = new ui.classDiagram.Visibility({
                placeAt: this.visibilityId,
                visibility: value
            });

            //create tag
            this.visibility.create();
        }

        //otherwise activate the existing icon
        else {
            this.visibility.activate();
            this.visibility.setValue(value);
        }
    },

    /**
     * sets a return type tag
     */
    setReturnType: function(value) {
        //create return type tag
        if(!this.returnType) {
            //init return type
            this.returnType = new ui.classDiagram.ReturnType({
                placeAt: this.returnTypeId,
                dataType: value
            });

            //create tag
            this.returnType.create();
        }

        //otherwise activate existing tag
        else {
            this.returnType.activate();
            this.returnType.setValue(value);
        }
    },

    /**
     * sets a property tag
     */
    setProperty: function(value) {
        //create property tag
        if(!this.property) {
            //init property
            this.property = new ui.classDiagram.Property({
                placeAt: this.propertyId,
                property: value
            });

            //create tag
            this.property.create();
        }

        //otherwise activate existing tag
        else {
            this.property.activate();
            this.property.setValue(value);
        }
    },

    /**
     * updates an existing parameter list
     * @param parameter
     */
    setParameter: function(parameter) {
        //destroy old paramter list
        if(this.parameterList) for(var id in this.parameterList) {
            this.parameterList[id].destroy(true);
        } this.parameterList = null;

        //add updated parameter
        if(parameter) this.addParameter(parameter);
    },

    /**
     * creates a new parameter and
     * add it into the parameter list
     */
    addParameter: function(properties) {
        var parameter = null;

        //properties is an array of params
        if(properties[0]) {
            dojo.forEach(properties, dojo.hitch(this, function(param) {
                this.addParameter(param);
            }));
        } else {
            //create parameter
            parameter = new ui.classDiagram.Parameter({
                placeAt: this.parameterListId,
                direction: properties.direction,
                name: properties.name,
                dataType: properties.dataType,
                multiplicity: properties.multiplicity,
                defaultValue: properties.defaultValue,
                property: properties.property,
                modifier: properties.modifier
            });

            if(!this.parameterList) this.parameterList = {};
            //TODO remove if already exists
            this.parameterList[parameter.htmlId] = parameter;
        }
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddOperation({
                title: "Edit Operation (" + this.name.value + ")",
                editableOperation: this,
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
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
    },

    /**
     * gets each necessary info about
     * the operation as a JSON object
     */
    getJSON: function() {
        //TODO implement JavaDoc
        var javaDoc = null;

        //get modifier
        var modifier = this.modifier ? this.modifier.split(" ") : [];

        //checks whether param is an array
        var arrayPos = this.returnType.value ? this.returnType.value.search(/\[.*\]/) : -1;
        var isArray = (arrayPos != -1) ? true : false;

        //search for generic declarations
        var genericStartPos = this.returnType.value ? this.returnType.value.search(/<.+>/) : -1;
        var genericEndPos = this.returnType.value ? this.returnType.value.search(/>/) : -1;
        var generic = null;

        if(genericStartPos != -1) {
            generic = this.returnType.value.slice(genericStartPos+1, genericEndPos);
        }

        //get data type
        var returnType = this.returnType.value || "void";
        if(this.isConstructor) returnType = "constructor";
        if(genericStartPos != -1) {
            returnType = returnType.slice(0, genericStartPos);
        } else if(arrayPos != -1) {
            returnType = returnType.slice(0, arrayPos);
        }

        //get visibility
        var visibility = null;
        if(this.visibility.value == "+")
            visibility = "public";
        else if(this.visibility.value == "#")
            visibility = "protected";
        else if(this.visibility.value == "-")
            visibility = "private";

        return {
            "type": "method",
            "javaDoc" : javaDoc,
            "visibility": visibility,
            "modifier": modifier,
            "dataType": returnType,
            "generic": generic,
            "array": isArray,
            "name": this.name.value,
            "parameter": this.getParameter(),
            "body": this.body || null,
            "isConstructor": this.isConstructor
        };
    },

    /**
     * gets each parameter as an array
     * of objects
     * @return {
     *   error: array of names,
     *   "parameterName": {
     *     name: string parameter name,
     *     dataType: string parameter data type
     *   }
     * }
     * 
     */
    getParameter: function() {
        //iterate parameter
        var paramList = [];
        for(var id in this.parameterList) {
            paramList.push(this.parameterList[id].getJSON());
        }

        return paramList;
    }
});

/**
 * implementation of a parameter
 * [direction] Name :DataType [Multiplicity] [=DefaultValue] [{Property}]
 */
dojo.declare("ui.classDiagram.Parameter", ui.Object, {
    editDialog: null,

    //properties
    direction: null,
    name: null,
    dataType: null,
    multiplicity: null,
    defaultValue: null,
    property: null,
    modifier: null,

    //ids
    directionId: null,
    nameId: null,
    dataTypeId: null,
    multiplicityId: null,
    defaultValueId: null,
    propertyId: null,

    constructor: function(args) {
        args = args || {};

        //create and place operation entry
        this.create(args.name);

        //initialize properties
        this.setDirection(args.direction);
        this.setDataType(args.dataType);
        this.setMultiplicity(args.multiplicity);
        this.setDefaultValue(args.defaultValue);
        this.setProperty(args.property);
        this.setModifier(args.modifier);
    },

    /**
     * places and creates parameter
     * @param name
     */
    create: function(name) {
        this.inherited(arguments);

        //create ids
        this.directionId = this.htmlId + "Direction";
        this.nameId = this.htmlId + "Name";
        this.dataTypeId = this.htmlId + "DataType";
        this.multiplicityId = this.htmlId + "Multiplicity";
        this.defaultValueId = this.htmlId + "DefaultValue";
        this.propertyId = this.htmlId + "Property";

        //init attribute name
        this.name = new ui.classDiagram.Name({
            placeAt: this.nameId,
            type: "parameter",
            component: this,
            name: name
        });

        //place attribute
        dojo.place(
            '<div class="parameter" id="' + this.htmlId + '">' +
                '<div style="float: left;" id="' + this.directionId + '"></div>' +
                '<div style="float: left;" id="' + this.nameId + '"></div>' +
                '<div style="float: left;" id="' + this.dataTypeId + '"></div>' +
                '<div style="float: left;" id="' + this.multiplicityId + '"></div>' +
                '<div style="float: left;" id="' + this.defaultValueId + '"></div>' +
                '<div style="float: left;" id="' + this.propertyId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //create name
        this.name.create();
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        if(this.editDialog) this.editDialog.close();
        if(this.direction) this.direction.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        this.inherited(arguments);
    },

    /**
     * gets each necessary info
     * and returns it as a JSON object
     */
    getJSON: function() {
        //checks whether param is an array
        var arrayPos = this.dataType.value ? this.dataType.value.search(/\[.*\]/) : -1;
        var isArray = (arrayPos != -1) ? true : false;

        //check multiplicity. it has a higher priority then the array declaration
        var hasStarletSelector = (this.multiplicity.value && this.multiplicity.value.search(/\*/) != -1) ? true : false;
        //TODO allow 10, 100 or other, but 0 or 1
        var hasPointSelector = (this.multiplicity.value && this.multiplicity.value.search(/\.\.[2-9*]+/) != -1) ? true : false;
        if(this.multiplicity.value === "1") {
            isArray = false;
        } else if(hasStarletSelector || hasPointSelector) {
            isArray = true;
        }

        //search for generic declarations
        var genericStartPos = this.dataType.value ? this.dataType.value.search(/<.+>/) : -1;
        var genericEndPos = this.dataType.value ? this.dataType.value.search(/>/) : -1;
        var generic = null;

        if(genericStartPos != -1) {
            generic = this.dataType.value.slice(genericStartPos+1, genericEndPos);
        }

        //get data type
        var dataType = this.dataType.value || "Object";
        if(genericStartPos != -1) {
            dataType = dataType.slice(0, genericStartPos);
        } else if(arrayPos != -1) {
            dataType = dataType.slice(0, arrayPos);
        }

        //get modifier
        var modifier = this.modifier ? this.modifier.split(" ") : [];

        return {
            "type": "parameter",
            "modifier": modifier,
            "generic": generic,
            "array": isArray,
            "dataType": dataType,
            "name": this.name.value
        }
    },

    /**
     * sets the name
     * @param value
     */
    setName: function(value) {
        this.name.setValue(value);
    },

    /**
     * sets parameter modifier
     * @param value
     */
    setModifier: function(value) {
        this.modifier = value;
    },

    setDirection: function(value) {
        //create a new visibility tag
        if(!this.direction) {
            //init visibility
            this.direction = new ui.classDiagram.Direction({
                placeAt: this.directionId,
                direction: value
            });

            //create tag
            this.direction.create();
        }

        //otherwise activate the existing icon
        else {
            this.direction.activate();
            this.direction.setValue(value);
        }
    },

    setDataType: function(value) {
        //create return type tag
        if(!this.dataType) {
            //init return type
            this.dataType = new ui.classDiagram.ReturnType({
                placeAt: this.dataTypeId,
                dataType: value
            });

            //create tag
            this.dataType.create();
        }

        //otherwise activate existing tag
        else {
            this.dataType.activate();
            this.dataType.setValue(value);
        }
    },

    setMultiplicity: function(value) {
        //create multiplicity tag
        if(!this.multiplicity) {
            //init return type
            this.multiplicity = new ui.classDiagram.Multiplicity({
                placeAt: this.multiplicityId,
                multiplicity: value
            });

            //create tag
            this.multiplicity.create();
        }

        //otherwise activate existing tag
        else {
            this.multiplicity.activate();
            this.multiplicity.setValue(value);
        }
    },

    setDefaultValue: function(value) {
        //create return type tag
        if(!this.defaultValue) {
            //init return type
            this.defaultValue = new ui.classDiagram.DefaultValue({
                placeAt: this.defaultValueId,
                value: value
            });

            //create tag
            this.defaultValue.create();
        }

        //otherwise activate existing tag
        else {
            this.defaultValue.activate();
            this.defaultValue.setValue(value);
        }
    },

    setProperty: function(value) {
        //create property tag
        if(!this.property) {
            //init property
            this.property = new ui.classDiagram.Property({
                placeAt: this.propertyId,
                property: value
            });

            //create tag
            this.property.create();
        }

        //otherwise activate existing tag
        else {
            this.property.activate();
            this.property.setValue(value);
        }
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddParameter({
                title: "Edit Parameter (" + this.name.value + ")",
                editableParameter: this,
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
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
});

/**
 * an icon component
 */
dojo.declare("ui.classDiagram.Icon", ui.Object, {
    menuStructure: null,
    isSet: null,
    icon: null,
    menu: null,

    /**
     * TODO documentation
     * initializes components
     * menu: {
     *  title: "menu title"
     *  buttons: [
     *      {
     *          title: "button title",
     *          icon: "css class",
     *          onClick: function(){},
     *          description: "tooltip description",
     *      }
     *  ]
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.icon = args.icon;
        this.menuStructure = args.menu;
        this.isSet = true;
    },

    /**
     * creates a new icon with
     * context menu 
     */
    create: function() {
        this.inherited(arguments);

        //create icon
        dojo.place(
            '<div class="component icon" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //add icon
        this.setIcon(this.icon);

        //create a new context menu
        if(this.menuStructure) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.htmlId]);
        }

        //activate icon
        if(!this.isSet) {
            this.activate();
        }
    },

    /**
     * activates event handler
     * and shows icon
     */
    activate: function(setIcon) {
        setIcon = (typeof setIcon == "boolean") ? setIcon : true;
        if(setIcon) this.setIcon(this.icon);
        this.inherited(arguments);
        this.isSet = true;
    },

    /**
     * deactivates event handler
     * and hides icon
     */
    deactivate: function(setIcon) {
        setIcon = (typeof setIcon == "boolean") ? setIcon : true;
        if(setIcon) this.setIcon();
        this.inherited(arguments);
        this.isSet = false;
    },

    /**
     * sets a new icon. if no param is
     * given it will hide the current
     * displayed icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        this.icon = icon || this.icon;
        var node = dojo.byId(this.htmlId);

        //if icon is deactivated activate it instead
        if(!this.isSet) {
            this.activate(false);
        }

        //set icon
        if(node && icon) {
            dojo.attr(node, "class", "component icon " + icon);
            dojo.style(node, "display", "");
        }

        //hide icon
        else if(node && !icon) {
            dojo.style(node, "display", "none");
        }
    },

    /**
     * destroys each registered event handler
     * and components with context menu
     */
    destroy: function(del) {
        if(this.menu) this.menu.destroy(true);
        this.inherited(arguments);
    }
});

/**
 * a text component
 */
dojo.declare("ui.classDiagram.Text", ui.Object, {
    onValueChange: null,
    lockDeactivation: null,
    menuStructure: null,
    editOnClick: null,
    isSelected: null,
    startTagValue: null,
    endTagValue: null,
    defaultValue: null,
    value: null,
    isSet: null,
    menu: null,

    //ids
    labelId: null,
    inputId: null,

    /**
     * initializes text component
     * args: {
     *  placeAt: "parent id",
     *  value: "text",
     *  defaultValue: "default text",
     *  editOnClick: boolean,
     *  menu: context menu structure,
     *  onValueChange: function()
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.value;
        this.defaultValue = args.defaultValue;
        this.menuStructure = args.menu;
        this.editOnClick = args.editOnClick;
        this.onValueChange = args.onValueChange;
        this.isSet = true;
    },

    /**
     * creates and places a new text input
     */
    create: function() {
        this.inherited(arguments);

        //create input id
        this.inputId = this.htmlId + "Input";
        this.labelId = this.htmlId + "Label";
        this.startTagId = this.htmlId + "StartTag";
        this.endTagId = this.htmlId + "EndTag";

        //create text input
        if(!dojo.byId(this.htmlId)) {
            dojo.place(
                '<div class="component text" id="' + this.htmlId + '">' +
                    '<div class="tag" id="' + this.startTagId + '"></div>' +
                    '<div class="label" id="' + this.labelId + '"></div>' +
                    '<input type="text" class="input" readonly="readonly" size="1" id="' + this.inputId + '" />' +
                    '<div class="tag" id="' + this.endTagId + '"></div>' +
                '</div>',
                dojo.byId(this.placeAt)
            );
        }

        //set value
        this.setValue(this.value);

        //hide input
        this.select(false);

        if(this.editOnClick) {
            //activate input after click
            this.connect({
                name: "ActivateInput",
                event: "onclick",
                nodeId: this.labelId,
                method: function(event) {
                    dojo.stopEvent(event);
                    this.select(true);
                }
            });
        }

        //stop event bubbling for key bindings
        this.connect({
            name: "StopClickBubbling",
            event: "onkeyup",
            nodeId: this.inputId,
            method: function(event) {
                if(this.isSelected)
                    dojo.stopEvent(event);
            }
        });
        
        //deactivate input if click is out of focus
        this.connect({
            name: "DeactivateInput",
            event: "onclick",
            body: true,
            method: function(event) {
                if(!this.lockDeactivation && this.isSelected) {
                    var node = event.target;
                    var isInput = node.id == this.htmlId || node.id == this.inputId;
                    var isLabel = node.id == this.labelId;

                    //deactivate text input and show new label
                    if(!isInput && !isLabel) this.select(false);
                } else {
                    //unlock deactivation
                    this.lockDeactivation = false;
                }
            }
        });

        //set dynamic input size and
        //store the input value after change
        this.connect({
            event: "onkeyup",
            nodeId: this.inputId,
            method: function(event) {
                //get input node
                var input = dojo.byId(this.inputId);

                //set input size
                var length = input.value.length;
                if(length <= 0) length = 1;
                dojo.attr(input, "size", length);

                //store new value
                this.setValue(input.value, false);

                //deactivate on enter
                if(event.keyCode == 13) {
                    this.select(false);
                }
            }
        });

        //create a new context menu
        if(this.menuStructure && !this.menu) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.labelId]);
        }

        //activate input
        if(!this.isSet) {
            this.activate();
        }
    },

    /**
     * selects (select = true) or
     * deselects (select = false) text input
     * @param select boolean
     */
    select: function(select) {
        var input = dojo.byId(this.inputId);
        var label = dojo.byId(this.labelId);

        if(select) {
            this.isSelected = true;

            //set input size
            var length = input.value.length;
            if(length <= 0) length = 1;
            dojo.attr(input, "size", length);

            //set node properties
            dojo.addClass(input, "selected");
            dojo.removeAttr(input, "readonly");
            dojo.style(label, "display", "none");
            dojo.style(input, "display", "");

            //set cursor
            input.selectionStart = input.value.length;
            input.selectionEnd = input.value.length;
            //console.debug(input);
        } else {
            //update input value
            this.setValue(input.value);

            this.isSelected = false;
            dojo.removeClass(input, "selected");
            dojo.attr(input, "readonly", "readonly");
            dojo.style(input, "display", "none");

            //show updated label
            label.innerHTML = this.value ? this.value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
            dojo.style(label, "display", "");
        }
    },

    /**
     * sets a new value. if no value is given it will hide it
     * @param value string
     * @param force boolean if true the given value will written into input
     */
    setValue: function(value, force) {
        force = (typeof force == "boolean") ? force : true;
        value = (!value || value == "") ? null : value;
        var displayedValue = value ? value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
        this.value = value;

        //execute change function
        if(this.onValueChange) this.onValueChange(this.value);

        //if tag is deactivated activate it instead
        if(!this.isSet) {
            this.activate(false);
        }

        //get nodes
        var node = dojo.byId(this.htmlId);
        var label = dojo.byId(this.labelId);
        var input = dojo.byId(this.inputId);

        //set as input value and label
        if(force && value) {
            label.innerHTML = displayedValue;
            input.value = this.value;

            //show tag
            dojo.style(node, "display", "");
        }

        //hide if no value is given
        if(!value && force) {
            if(!this.defaultValue) {
                label.innerHTML = displayedValue;
                input.value = this.value;

                //hide tag
                dojo.style(node, "display", "none");
            }

            else {
                //show default value instead
                this.setValue(this.defaultValue);
            }
        }
    },

    /**
     * activates event handler
     * and shows label
     * @param setValue boolean if false no value will set
     */
    activate: function(setValue) {
        setValue = (typeof setValue == "boolean") ? setValue : true;
        if(setValue) this.setValue(this.value);
        this.inherited(arguments);
        this.isSet = true;
    },

    /**
     * deactivates event handler
     * and hides label
     * @param setValue boolean if false the value won't be removed
     */
    deactivate: function(setValue) {
        setValue = (typeof setValue == "boolean") ? setValue : true;
        if(setValue) this.setValue();
        this.inherited(arguments);
        this.isSet = false;
    },

    /**
     * sets the start tag
     * @param tag string
     */
    setStartTag: function(tag) {
        var node = dojo.byId(this.startTagId);
        this.startTagValue = tag || "";

        if(node && tag) {
            //set tag
            node.innerHTML = tag;
            //show tag
            dojo.style(node, "display", "");
        } else if(node) {
            //hide tag
            node.innerHTML = "";
            dojo.style(node, "display", "none");
        }
    },

    /**
     * sets the start tag
     * @param tag string
     */
    setEndTag: function(tag) {
        var node = dojo.byId(this.endTagId);
        this.endTagValue = tag || "";

        if(node && tag) {
            //set tag
            node.innerHTML = tag;
            //show tag
            dojo.style(node, "display", "");
        } else if(node) {
            //hide tag
            node.innerHTML = "";
            dojo.style(node, "display", "none");
        }
    },

    /**
     * destroys input and context menu
     * @param del
     */
    destroy: function(del) {
        if(this.menu) this.menu.destroy(true);
        this.inherited(arguments);
    }
});

/**
 * visibility
 */
dojo.declare("ui.classDiagram.Visibility", ui.classDiagram.Text, {
    /**
     * initializes visibility
     * args: {
     *  placeAt: "parent id",
     *  visibility: "public", "private", "protected" or "package"
     * }
     *
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.visibility;
    },

    /**
     * creates the context menu and tag
     */
    create: function() {
        //set up a context menu for visibilities
        this.menuStructure = {
            title: "Visibility",
            buttons: [
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                },
                {
                    icon: "public",
                    title: "public",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("public");
                    })
                },
                {
                    icon: "protected",
                    title: "protected",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("protected");
                    })
                },
                {
                    icon: "private",
                    title: "private",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("private");
                    })
                },
                {
                    icon: "package",
                    title: "package",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("package");
                    })
                }
            ]
        };

        //create icon
        this.inherited(arguments);
    },

    setValue: function(value) {
        if(value == "public") value = "+";
        else if(value == "protected") value = "#";
        else if(value == "private") value = "-";
        else if(value == "package") value = "~";

        this.inherited(arguments);
    },

    /**
     * gets the visibility as name
     */
    getVisibility: function() {
        if(this.value == "+") return "public";
        else if(this.value == "#") return "protected";
        else if(this.value == "-") return "private";
        else if(this.value == "~") return "package";
    }
});

/**
 * name input
 */
dojo.declare("ui.classDiagram.Name", ui.classDiagram.Text, {
    menuTitle: null,
    component: null,
    type: null,

    /**
     * initializes name component
     * args: {
     *  placeAt: "parent id",
     *  component: ui.classDiagram.Operation || ui.classDiagram.Attribute,
     *  name: "operation or attribute name",
     *  type: "operation" or "attribute"
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.name;
        this.type = args.type || "attribute";
        this.component = args.component;

        //set up operation
        if(this.type == "operation") {
            this.menuTitle = "Operation";
            if(!this.value || this.value === "") this.value = this.type;
        }

        //or set up attribute
        else if(this.type == "attribute") {
            this.menuTitle = "Attribute";
            if(!this.value || this.value === "") this.value = this.type;
        }

        //otherwise set up parameter
        else if(this.type == "parameter") {
            this.menuTitle = "Parameter";
            if(!this.value || this.value === "") this.value = this.type;
        }

        //set default value
        this.defaultValue = this.value;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create buttons
        var editBtn = {
            icon: "edit",
            title: "Edit",
            onClick: dojo.hitch(this, function(event) {
                this.component.edit();
            })
        };

        var renameBtn = {
            icon: "rename",
            title: "Rename",
            onClick: dojo.hitch(this, function(event) {
                //lock deactivation once
                this.lockDeactivation = true;
                //show text input
                this.select(true);
            })
        };

        var removeBtn = {
            title: "Remove",
            onClick: dojo.hitch(this, function(event) {
                //destroy component
                this.component.destroy(true);
            })
        };

        //create context menu
        this.menuStructure = {
            title: this.menuTitle,
            buttons: [editBtn, renameBtn, removeBtn]
        };

        //create name component
        this.inherited(arguments);
    }
});

/**
 * return type input
 */
dojo.declare("ui.classDiagram.ReturnType", ui.classDiagram.Text, {
    /**
     * initializes return type component
     * args: {
     *  placeAt: "parent id",
     *  dataType: "void", "boolean" or another data type
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.dataType;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Return Type",
            buttons: [
                {
                    icon: "edit",
                    title: "Edit",
                    onClick: dojo.hitch(this, function(event) {
                        //lock deactivation once
                        this.lockDeactivation = true;
                        //show text input
                        this.select(true);
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                },
                {
                    title: "void",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("void");
                    })
                },
                {
                    title: "boolean",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("boolean");
                    })
                },
                {
                    title: "byte",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("byte");
                    })
                },
                {
                    title: "char",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("char");
                    })
                },
                {
                    title: "double",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("double");
                    })
                },
                {
                    title: "float",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("float");
                    })
                },
                {
                    title: "int",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("int");
                    })
                },
                {
                    title: "long",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("long");
                    })
                },
                {
                    title: "short",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("short");
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set start tag
        this.setStartTag(":");
    },

    /**
     * gets the data type without the
     * generic and array declaration
     */
    getDataType: function() {
        var arrayPos = this.value ? this.value.search(/\[/) : -1;
        var genericPos = this.value ? this.value.search(/</) : -1;

        if(genericPos !== -1) {
            return this.value.slice(0, genericPos);
        } else if(arrayPos !== -1) {
            return this.value.slice(0, arrayPos);
        } else {
            return this.value;
        }
    }
});

/**
 * return type input
 */
dojo.declare("ui.classDiagram.Property", ui.classDiagram.Text, {
    /**
     * initializes return type component
     * args: {
     *  placeAt: "parent id",
     *  dataType: "void", "boolean" or another data type
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.property;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Property",
            buttons: [
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                },
                {
                    title: "readOnly",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("readOnly");
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set start tag
        this.setStartTag("{");
        this.setEndTag("}");
    }

    //TODO create setValue function for special properties like "redefines <attribute_name>"
});

/**
 * return type input
 */
dojo.declare("ui.classDiagram.DefaultValue", ui.classDiagram.Text, {
    valueType: null,
    /**
     * initializes return value component
     * args: {
     *  placeAt: "parent id",
     *  value: number | string | boolean
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.value;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Default Value",
            buttons: [
                {
                    title: "Edit",
                    onClick: dojo.hitch(this, function(event) {
                        //lock deactivation once
                        this.lockDeactivation = true;
                        //show text input
                        this.select(true);
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set start tag
        this.setStartTag("=");
    },

    /**
     * sets the default value
     * and gets the data type of the
     * given value
     * @param value
     */
    setValue: function(value) {
        var type = typeof value;

        //get boolean
        if(type == "boolean") {
            this.valueType = type;
            if(value) value = "true";
            else value = "false";
        }

        //get numbers and strings
        else if(type == "number" || type == "string") {
            this.valueType = type;
        }

        //else data type can't prepare
        else {
            this.valueType = null;
            value = undefined;
        }

        this.inherited(arguments);
    }

    //TODO create setValue function for special properties like "redefines <attribute_name>"
});

/**
 * multiplicity input
 */
dojo.declare("ui.classDiagram.Multiplicity", ui.classDiagram.Text, {
    /**
     * initializes multiplicity tag
     * args: {
     *  placeAt: "parent id",
     *  multiplicity: string
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.multiplicity;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Multiplicity",
            buttons: [
                {
                    title: "Edit",
                    onClick: dojo.hitch(this, function(event) {
                        //lock deactivation once
                        this.lockDeactivation = true;
                        //show text input
                        this.select(true);
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                },
                {
                    title: "[0..*]",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("0..1");
                    })
                },
                {
                    title: "[1]",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("1");
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set start tag
        this.setStartTag("[");
        this.setEndTag("]");
    }
});

/**
 * direction input
 */
dojo.declare("ui.classDiagram.Direction", ui.classDiagram.Text, {
    /**
     * initializes direction tag
     * args: {
     *  placeAt: "parent id",
     *  direction: string
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.direction;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Direction",
            buttons: [
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.deactivate();
                    })
                },
                {
                    title: "in",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("in");
                    })
                },
                {
                    title: "out",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("out");
                    })
                },
                {
                    title: "inout",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("inout");
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);
    }
});

/**
 * class name
 */
dojo.declare("ui.classDiagram.ClassName", ui.classDiagram.Text, {
    component: null,
    
    /**
     * initializes direction tag
     * args: {
     *  placeAt: "parent id",
     *  name: string,
     *  component: ui.classDiagram.Class
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.name || "NewClass";
        this.component = args.component;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Class",
            buttons: [
                {
                    title: "Edit",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.edit();
                    })
                },
                {
                    title: "Rename",
                    onClick: dojo.hitch(this, function(event) {
                        //lock deactivation once
                        this.lockDeactivation = true;
                        //show text input
                        this.select(true);
                    })
                },
                {
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.destroy();
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set special css class
        dojo.attr(dojo.byId(this.htmlId), "class" ,"component classname");
    }
});