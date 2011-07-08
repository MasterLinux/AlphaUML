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
    name: null,
    nameInput: null,
    isSelected: null,
    stereotype: null,
    isAbstract: null,
    attributes: null,
    operations: null,
    error: null,
    x: null,
    y: null,

    //dialogs
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
                        '<div class="icon pin" id="' + this.pinIconId + '"></div>' +
                    '</div>' +
                    '<div class="title" id="' + this.titleId + '">' +
                        '<div class="stereotype" id="' + this.stereotypeId + '"></div>' +
                        '<div class="name" id="' + this.nameId + '"></div>' +
                        '<div class="abstract" id="' + this.abstractId + '"></div>' +
                    '</div>' +
                    '<div class="body" id="' + this.innerId + '">' +
                        '<div class="bodyHeader">' +
                            '<div class="bodyTitle">' + this.language.ADD_ATTRIBUTE_BTN + '</div>' +
                            '<div class="button" id="' + this.addAttributeBtnId + '">+</div>' +
                        '</div>' +
                        '<div class="attributes" id="' + this.attributesId + '"></div>' +
                        '<div class="bodyHeader">' +
                            '<div class="bodyTitle">' + this.language.ADD_OPERATION_BTN + '</div>' +
                            '<div class="button" id="' + this.addOperationBtnId + '">+</div>' +
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

        //select class
        this.connect({
            name: "Select",
            nodeId: this.htmlId,
            event: "onclick",
            method: function(event) {
                this.select(true);
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
                if(!this.addOperationDialog) {
                    //if dialog doesn't exists create a new one
                    this.addOperationDialog = new ui.dialog.AddOperation({
                        placeAt: "main", //this.placeAt,
                        title: "Add Operation (" + this.name + ")",
                        onSelect: dojo.hitch(this, function() {
                            this.select(true);
                        }),
                        onExecute: dojo.hitch(this, function(properties) {
                            //add a new operation
                            this.addOperation({
                                visibility: properties.visibility,
                                name: properties.name,
                                parameter: properties.parameter,
                                returnType: properties.returnType,
                                property: properties.property
                            });
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
                if(!this.addAttributeDialog) {
                    //if dialog doesn't exists create a new one
                    this.addAttributeDialog = new ui.dialog.AddAttribute({
                        placeAt: "main",
                        title: "Add Attribute (" + this.name + ")",
                        onSelect: dojo.hitch(this, function() {
                            this.select(true);
                        }),
                        onExecute: dojo.hitch(this, function(properties) {
                            //add a new attribute
                            this.addAttribute({
                                visibility: properties.visibility,
                                name: properties.name,
                                dataType: properties.dataType,
                                multiplicity: properties.multiplicity,
                                defaultValue: properties.defaultValue,
                                property: properties.property
                            });
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
    },

    /**
     * destroys the class
     */
    destroy: function() {
        if(this.stereotypeMenu) {
            this.stereotypeMenu.destroy(true);
        }
        //this.operations
        //this.attributes

        this.inherited(arguments);
    },

    activate: function() {
        for(var id in this.operations) {
            this.operations[id].activate();
        }

        for(var id in this.attributes) {
            this.attributes[id].deactivate();
        }

        this.inherited(arguments);
    },

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
            this.setPosition(this.x, this.y - 29);
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
            this.setPosition(this.x, this.y + 29);
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
                title: "auxiliary",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("auxiliary");
                })
            },
            {
                title: "focus",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("focus");
                })
            },
            {
                title: "implementation class",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("implementation class");
                })
            },
            {
                title: "type",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("type");
                })
            },
            {
                title: "interface",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("interface");
                })
            },
            {
                title: "utility",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("utility");
                })
            },
            {
                title: "dataType",
                onClick: dojo.hitch(this, function() {
                    this.setStereotype("dataType");
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
        var nameNode = dojo.byId(this.nameId);
        this.name = name || "unnamed";

        if(nameNode) {
            nameNode.innerHTML = this.name;
        }
    },

    /**
     * creates a new operation and
     * add it into the operation list
     */
    addOperation: function(properties) {
        var operation = new ui.classDiagram.Operation({
            placeAt: this.operationsId,
            visibility: properties.visibility,
            name: properties.name,
            parameter: properties.parameter,
            returnType: properties.returnType,
            property: properties.property
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
            property: properties.property
        });

        if(!this.attributes) this.attributes = {};
        //TODO remove if already exists
        this.attributes[attribute.htmlId] = attribute;

        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * TODO update method
     * sets the size of the class
     * if no param is given it
     * calculates the max needed size
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        /*
        var innerNode = dojo.byId(this.innerId);
        var titleNode = dojo.byId(this.titleId);
        var bodyNode = dojo.byId(this.bodyId);

        dojo.style(innerNode, "width", "auto");


        var titlePos = dojo.position(titleNode, true);
        var bodyPos = dojo.position(bodyNode, true);
        var width = Math.max(titlePos.w, bodyPos.w);

        dojo.style(innerNode, "width", width + "px");
        //if(bodyNode) dojo.style(bodyNode, "width", size.w + "px"); */

    },

    /**
     * gets class operations
     */
    getOperations: function() {
        var ops = {};

        //get all info
        for(var id in this.operations) {
            var op = this.operations[id];
            var opReturnType = op.getReturnType();
            var opParameter = op.getParameter();
            var opName = op.getName();

            if(!ops[opName]) ops[opName] = {
                name: opName,
                parameter: opParameter,
                returnType: opReturnType,
                visibility: op.getVisibility(),
                property: op.getProperty()
            }

            //set error
            else this.error.push({
                message: this.language.OPERATION_DUPLICATE,
                value: opName
            });
        }

        return ops;
    }
});

/**
 * implementation of an attribute
 * [Visibility] [/] Name [:DataType] [Multiplicity] [=DefaultValue] [{Property}]
 */
dojo.declare("ui.classDiagram.Attribute", ui.Object, {
    visibility: null,
    name: null,
    dataType: null,
    multiplicity: null,
    defaultValue: null,
    property: null,
    editDialog: null,

    //ids
    visibilityId: null,
    nameId: null,
    dataTypeId: null,
    multiplicityId: null,
    defaultValueId: null,
    propertyId: null,

    //init properties
    visibilityValue: null,
    nameValue: null,
    dataTypeValue: null,
    multiplicityValue: null,
    defaultValueValue: null,
    propertyValue: null,

    constructor: function(args) {
        args = args || {};
        this.visibilityValue = args.visibility;
        this.nameValue = args.name;
        this.dataTypeValue = args.dataType;
        this.multiplicityValue = args.multiplicity;
        this.defaultValueValue = args.defaultValue;
        this.propertyValue = args.property;

        //create and place operation entry
        this.create();
    },

    create: function() {
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
            name: this.nameValue
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

        //initialize properties
        if(this.visibilityValue) {
            this.addVisibility(this.visibilityValue);
        }

        if(this.dataTypeValue) {
            this.addDataType(this.dataTypeValue);
        }

        if(this.multiplicityValue) {
            this.addMultiplicity(this.multiplicityValue);
        }

        if(this.defaultValueValue) {
            this.addDefaultValue(this.defaultValueValue);
        }

        if(this.propertyValue) {
            this.addProperty(this.propertyValue);
        }
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        if(this.visibility) this.visibility.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        this.inherited(arguments);
    },

    addVisibility: function(value) {
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
        else this.visibility.activate();
    },

    addDataType: function(value) {
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
        else this.dataType.activate();
    },

    addMultiplicity: function(value) {
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
        else this.multiplicity.activate();
    },

    addDefaultValue: function(value) {
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
        else this.defaultValue.activate();
    },

    addProperty: function(value) {
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
        else this.property.activate();
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddAttribute({
                placeAt: "main", //this.placeAt,
                title: "Edit Attribute (" + this.name.value + ")",
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
                onExecute: dojo.hitch(this, function(properties) {
                    //update visibility
                    if(this.visibility) {
                        //set new icon if given
                        if(properties.visibility) this.visibility.setIcon(properties.visibility);
                        //otherwise deactivate visibility
                        else this.visibility.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.visibility) {
                        this.addVisibility(properties.visibility);
                    }

                    //update name
                    if(this.name) this.name.setValue(properties.name);

                    //update data type
                    if(this.dataType) {
                        //set new value if given
                        if(properties.dataType) this.dataType.setValue(properties.dataType);
                        //otherwise deactivate data type
                        else this.dataType.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.dataType) {
                        this.addDataType(properties.dataType);
                    }

                    //update multiplicity
                    if(this.multiplicity) {
                        //set new value if given
                        if(properties.multiplicity) this.multiplicity.setValue(properties.multiplicity);
                        //otherwise deactivate multiplicity
                        else this.multiplicity.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.multiplicity) {
                        this.addMultiplicity(properties.multiplicity);
                    }

                    //update default value
                    if(this.defaultValue) {
                        //set new value if given
                        if(properties.defaultValue) this.defaultValue.setValue(properties.defaultValue);
                        //otherwise deactivate property tag
                        else this.defaultValue.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.defaultValue) {
                        this.addDefaultValue(properties.defaultValue);
                    }

                    //update property
                    if(this.property) {
                        //set new value if given
                        if(properties.property) this.property.setValue(properties.property);
                        //otherwise deactivate property tag
                        else this.property.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.property) {
                        this.addProperty(properties.property);
                    }
                }),
                onDestroy: dojo.hitch(this, function() {
                    //set instance var to null
                    this.editDialog = null;
                }),
                visibility: (this.visibility && this.visibility.isSet) ? this.visibility.icon : "",
                name: (this.name && this.name.isSet) ? this.name.value : "attribute",
                dataType: (this.dataType && this.dataType.isSet) ? this.dataType.value : "",
                multiplicity: (this.multiplicity && this.multiplicity.isSet) ? this.multiplicity.value : "",
                defaultValue: (this.defaultValue && this.defaultValue.isSet) ? this.defaultValue.value : "",
                property: (this.property && this.property.isSet) ? this.property.value : ""
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
    language: null,
    addParameterDialog: null,
    editDialog: null,
    visibilityValue: null,
    visibility: null,
    parameterListValue: null,
    parameterList: null,
    returnTypeValue: null,
    returnType: null,
    propertyValue: null,
    property: null,
    nameValue: null,
    name: null,
    error: null,

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
        this.visibilityValue = args.visibility;
        this.parameterListValue = args.parameter;
        this.returnTypeValue = args.returnType;
        this.propertyValue = args.property;
        this.nameValue = args.name;
        this.language = new ui.Language();

        //stores errors
        this.error = [];

        //create and place operation entry
        this.create();
    },

    /**
     * places and creates operation
     */
    create: function() {
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
            name: this.nameValue
        });

        //place operation
        dojo.place(
            '<div class="operation" id="' + this.htmlId + '">' +
                '<div style="float: left;" id="' + this.visibilityId + '"></div>' +
                '<div style="float: left;" id="' + this.nameId + '"></div>' +
                '<div style="float: left; padding: 2px;">(</div>' +
                '<div style="float: left;" id="' + this.parameterListId + '">' +
                    '<div class="button" id="' + this.addBtnId + '">+</div>' +
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
                if(!this.addParameterDialog) {
                    //if dialog doesn't exists create a new one
                    this.addParameterDialog = new ui.dialog.AddParameter({
                        placeAt: "main",
                        title: "Add Parameter (" + this.name.value + ")",
                        onSelect: dojo.hitch(this, function() {
                            //TODO select attribute
                            //this.select(true);
                        }),
                        onExecute: dojo.hitch(this, function(properties) {
                            //add a new attribute
                            this.addParameter({
                                direction: properties.direction,
                                name: properties.name,
                                dataType: properties.dataType,
                                multiplicity: properties.multiplicity,
                                defaultValue: properties.defaultValue,
                                property: properties.property
                            });
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

        //set up operation
        if(this.visibilityValue) {
            this.addVisibility(this.visibilityValue);
        }

        if(this.parameterListValue) {
            this.addParameter(this.parameterListValue);
        }

        if(this.returnTypeValue) {
            this.addReturnType(this.returnTypeValue);
        }

        if(this.propertyValue) {
            this.addProperty(this.propertyValue);
        }
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        if(this.visibility) this.visibility.destroy(true);
        if(this.returnType) this.returnType.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        //TODO iterate list -> if(this.parameterList)

        this.inherited(arguments);
    },

    /**
     * adds a visibility tag
     */
    addVisibility: function(value) {
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
        else this.visibility.activate();
    },

    /**
     * adds a return type tag
     */
    addReturnType: function(value) {
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
        else this.returnType.activate();
    },

    /**
     * adds a property tag
     */
    addProperty: function(value) {
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
        else this.property.activate();
    },

    /**
     * creates a new parameter and
     * add it into the parameter list
     */
    addParameter: function(properties) {
        var parameter = new ui.classDiagram.Parameter({
            placeAt: this.parameterListId,
            direction: properties.direction,
            name: properties.name,
            dataType: properties.dataType,
            multiplicity: properties.multiplicity,
            defaultValue: properties.defaultValue,
            property: properties.property
        });

        if(!this.parameterList) this.parameterList = {};
        //TODO remove if already exists
        this.parameterList[parameter.htmlId] = parameter;
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddOperation({
                placeAt: "main", //this.placeAt,
                title: "Edit Operation (" + this.name.value + ")",
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
                onExecute: dojo.hitch(this, function(properties) {
                    //update visibility
                    if(this.visibility) {
                        //set new icon if given
                        if(properties.visibility) this.visibility.setIcon(properties.visibility);
                        //otherwise deactivate visibility
                        else this.visibility.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.visibility) {
                        this.addVisibility(properties.visibility)
                    }

                    //update name
                    if(this.name) this.name.setValue(properties.name);

                    //update parameter
                    //TODO update parameter -> properties.parameter

                    //update return type
                    if(this.returnType) {
                        //set new value if given
                        if(properties.returnType) this.returnType.setValue(properties.returnType);
                        //otherwise deactivate return type
                        else this.returnType.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.returnType) {
                        this.addReturnType(properties.returnType)
                    }

                    //update property
                    if(this.property) {
                        //set new value if given
                        if(properties.property) this.property.setValue(properties.property);
                        //otherwise deactivate property tag
                        else this.property.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.property) {
                        this.addProperty(properties.property)
                    }
                }),
                onDestroy: dojo.hitch(this, function() {
                    //set instance var to null
                    this.editDialog = null;
                }),
                visibility: (this.visibility && this.visibility.isSet) ? this.visibility.icon : "",
                //parameter: string init value TODO
                returnType: (this.returnType && this.returnType.isSet) ? this.returnType.value : "",
                property: (this.property && this.property.isSet) ? this.property.value : "",
                name: (this.name && this.name.isSet) ? this.name.value : "operation"
            });

            this.editDialog.create();
        } else {
            //otherwise select existing dialog
            this.editDialog.select(true);
        }
    },

    /**
     * gets the name
     */
    getName: function() {
        if(this.name)
            return this.name.value;
        else
            return null;
    },

    /**
     * gets return type
     */
    getReturnType: function() {
        if(this.returnType)
            return this.returnType.value;
        else
            return null;
    },

    /**
     * gets the visibility
     */
    getVisibility: function() {
        if(this.visibility)
            return this.visibility.icon;
        else
            return null;
    },

    getProperty: function() {
        if(this.property)
            return this.property.value;
        else
            return null;
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
        var paramList = {};

        //iterate parameter
        for(var id in this.parameterList) {
            var paramName = this.parameterList[id].name.value;

            //TODO dataType have to set, so don't test it
            var paramDataType = null;
            if(this.parameterList[id].dataType)
                paramDataType = this.parameterList[id].dataType.value;

            var paramProperty = null;
            if(this.parameterList[id].property)
                paramProperty = this.parameterList[id].property.value;

            var paramMultiplicity = null;
            if(this.parameterList[id].multiplicity)
                paramMultiplicity = this.parameterList[id].multiplicity.value;

            var paramDefaultValue = null;
            if(this.parameterList[id].defaultValue)
                paramDefaultValue = this.parameterList[id].defaultValue.value;

            if(!paramList[paramName]) paramList[paramName] = {
                name: paramName,
                dataType: paramDataType,
                property: paramProperty,
                multiplicity: paramMultiplicity,
                defaultValue: paramDefaultValue
            }

            //set error
            else this.error.push({
                message: this.language.PARAMETER_DUPLICATE,
                value: paramName
            });
        }

        return paramList;
    }
});

/**
 * implementation of a parameter
 * [direction] Name :DataType [Multiplicity] [=DefaultValue] [{Property}]
 */
dojo.declare("ui.classDiagram.Parameter", ui.Object, {
    direction: null,
    name: null,
    dataType: null,
    multiplicity: null,
    defaultValue: null,
    property: null,
    editDialog: null,

    //ids
    directionId: null,
    nameId: null,
    dataTypeId: null,
    multiplicityId: null,
    defaultValueId: null,
    propertyId: null,

    //init properties
    directionValue: null,
    nameValue: null,
    dataTypeValue: null,
    multiplicityValue: null,
    defaultValueValue: null,
    propertyValue: null,

    constructor: function(args) {
        args = args || {};
        this.directionValue = args.direction;
        this.nameValue = args.name;
        this.dataTypeValue = args.dataType;
        this.multiplicityValue = args.multiplicity;
        this.defaultValueValue = args.defaultValue;
        this.propertyValue = args.property;

        //create and place operation entry
        this.create();
    },

    create: function() {
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
            name: this.nameValue
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

        //initialize properties
        if(this.directionValue) {
            this.addDirection(this.directionValue);
        }

        if(this.dataTypeValue) {
            this.addDataType(this.dataTypeValue);
        }

        if(this.multiplicityValue) {
            this.addMultiplicity(this.multiplicityValue);
        }

        if(this.defaultValueValue) {
            this.addDefaultValue(this.defaultValueValue);
        }

        if(this.propertyValue) {
            this.addProperty(this.propertyValue);
        }
    },

    /**
     * destroys operation
     * @param del
     */
    destroy: function(del) {
        if(this.direction) this.direction.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);
        if(this.property) this.property.destroy(true);
        if(this.name) this.name.destroy(true);

        this.inherited(arguments);
    },

    addDirection: function(value) {
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
        else this.direction.activate();
    },

    addDataType: function(value) {
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
        else this.dataType.activate();
    },

    addMultiplicity: function(value) {
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
        else this.multiplicity.activate();
    },

    addDefaultValue: function(value) {
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
        else this.defaultValue.activate();
    },

    addProperty: function(value) {
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
        else this.property.activate();
    },

    /**
     * opens the edit dialog for the
     * configuration of the operation
     */
    edit: function() {
        if(!this.editDialog) {
            //if dialog doesn't exists create a new one
            this.editDialog = new ui.dialog.AddParameter({
                placeAt: "main", //this.placeAt,
                title: "Edit Parameter (" + this.name.value + ")",
                onSelect: dojo.hitch(this, function() {
                    //TODO select class
                    //this.select(true);
                }),
                onExecute: dojo.hitch(this, function(properties) {
                    //update direction
                    if(this.direction) {
                        //set new icon if given
                        if(properties.direction) this.direction.setValue(properties.direction);
                        //otherwise deactivate direction
                        else this.direction.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.direction) {
                        this.addDirection(properties.direction);
                    }

                    //update name
                    if(this.name) this.name.setValue(properties.name);

                    //update data type
                    if(this.dataType) {
                        //set new value if given
                        if(properties.dataType) this.dataType.setValue(properties.dataType);
                        //otherwise deactivate data type
                        else this.dataType.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.dataType) {
                        this.addDataType(properties.dataType);
                    }

                    //update multiplicity
                    if(this.multiplicity) {
                        //set new value if given
                        if(properties.multiplicity) this.multiplicity.setValue(properties.multiplicity);
                        //otherwise deactivate multiplicity
                        else this.multiplicity.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.multiplicity) {
                        this.addMultiplicity(properties.multiplicity);
                    }

                    //update default value
                    if(this.defaultValue) {
                        //set new value if given
                        if(properties.defaultValue) this.defaultValue.setValue(properties.defaultValue);
                        //otherwise deactivate property tag
                        else this.defaultValue.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.defaultValue) {
                        this.addDefaultValue(properties.defaultValue);
                    }

                    //update property
                    if(this.property) {
                        //set new value if given
                        if(properties.property) this.property.setValue(properties.property);
                        //otherwise deactivate property tag
                        else this.property.deactivate();
                    }
                    //create new tag if doesn't exists
                    else if(properties.property) {
                        this.addProperty(properties.property);
                    }
                }),
                onDestroy: dojo.hitch(this, function() {
                    //set instance var to null
                    this.editDialog = null;
                }),
                direction: (this.direction && this.direction.isSet) ? this.direction.value : "",
                name: (this.name && this.name.isSet) ? this.name.value : "parameter",
                dataType: (this.dataType && this.dataType.isSet) ? this.dataType.value : "",
                multiplicity: (this.multiplicity && this.multiplicity.isSet) ? this.multiplicity.value : "",
                defaultValue: (this.defaultValue && this.defaultValue.isSet) ? this.defaultValue.value : "",
                property: (this.property && this.property.isSet) ? this.property.value : ""
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
 * visibility icon
 */
dojo.declare("ui.classDiagram.Visibility", ui.classDiagram.Icon, {
    /**
     * initializes visibility icon
     * args: {
     *  placeAt: "parent id",
     *  visibility: "public", "private", "protected" or "package"
     * }
     * 
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.icon = args.visibility || "package";
    },

    /**
     * creates the context menu and icon
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
                        this.setIcon("public");
                    })
                },
                {
                    icon: "protected",
                    title: "protected",
                    onClick: dojo.hitch(this, function(event) {
                        this.setIcon("protected");
                    })
                },
                {
                    icon: "private",
                    title: "private",
                    onClick: dojo.hitch(this, function(event) {
                        this.setIcon("private");
                    })
                },
                {
                    icon: "package",
                    title: "package",
                    onClick: dojo.hitch(this, function(event) {
                        this.setIcon("package");
                    })
                }
            ]
        };

        //create icon
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
                    this.select(true);
                }
            });
        }

        //deactivate input if click is out of focus
        this.connect({
            name: "DeactivateInput",
            event: "onclick",
            body: true,
            method: function(event) {
                if(!this.lockDeactivation) {
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
            label.innerHTML = this.value;
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
        this.value = value || this.value;

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
            label.innerHTML = this.value;
            input.value = this.value;

            //show tag
            dojo.style(node, "display", "");
        }

        //hide if no value is given
        if(!value && force) {
            if(!this.defaultValue) {
                label.innerHTML = this.value;
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

        var visibilityBtn = {
            title: "Add Visibility",
            onClick: dojo.hitch(this, function(event) {
                this.component.addVisibility();
            })
        };

        var propertyBtn = {
            title: "Add Property",
            onClick: dojo.hitch(this, function(event) {
                this.component.addProperty();
            })
        };

        var btns = null;
        //create operation menu
        if(this.type == "operation") {
            btns = [
                editBtn,
                renameBtn,
                removeBtn,
                visibilityBtn,
                {
                    title: "Add Parameter",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addParameter();
                    })
                },
                {
                    title: "Add Return Type",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addReturnType();
                    })
                },
                propertyBtn
            ];
        }

        //create attribute menu
        else if(this.type == "attribute") {
            btns = [
                editBtn,
                renameBtn,
                removeBtn,
                visibilityBtn,
                {
                    title: "Add Data Type",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addDataType();
                    })
                },
                {
                    title: "Add Multiplicity",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addMultiplicity();
                    })
                },
                {
                    title: "Add Default Value",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addDefaultValue();
                    })
                },
                propertyBtn
            ];
        }

        //create parameter menu
        else if(this.type == "parameter") {
            btns = [
                editBtn,
                renameBtn,
                removeBtn,
                {
                    title: "Add Direction",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addDirection();
                    })
                },
                {
                    title: "Add Data Type",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addDataType();
                    })
                },
                {
                    title: "Add Multiplicity",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addMultiplicity();
                    })
                },
                {
                    title: "Add Default Value",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addDefaultValue();
                    })
                },
                propertyBtn
            ];
        }

        //create context menu
        this.menuStructure = {
            title: this.menuTitle,
            buttons: btns
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
        this.value = args.dataType || "void";
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
                        //TODO store the user defined data type
                        //or search for other possibilities
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
                }
            ]
        };

        //create name component
        this.inherited(arguments);

        //set start tag
        this.setStartTag(":");
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
        this.value = args.property || "readOnly";
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
                },
                {
                    title: "ordered",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("ordered");
                    })
                },
                {
                    title: "sequence",
                    onClick: dojo.hitch(this, function(event) {
                        this.setValue("sequence");
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
        this.value = args.value || 42;
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
        this.value = args.multiplicity || "1";
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
        this.value = args.direction || "in";
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
                        //TODO open edit dialog
                        //this.component.edit();
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
                },
                {
                    title: "Set Abstract",
                    onClick: dojo.hitch(this, function(event) {
                        //TODO
                    })
                },
                {
                    title: "Stereotype",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.destroy();
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);
    }
});