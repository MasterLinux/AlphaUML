/**
 * User: Christoph Grundmann
 * Date: 21.06.11
 * Time: 16:42
 *
 */
dojo.provide("ui.classDiagram.Class");
dojo.require("ui.ContextMenu");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.Class", ui.Object, {
    dnd: null,
    name: null,
    isSelected: null,
    stereotype: null,
    isAbstract: null,
    attributes: null,
    operations: null,

    //context menus
    stereotypeMenu: null,

    //ids
    nameId: null,
    titleId: null,
    toolsId: null,
    abstractId: null,
    stereotypeId: null,
    attributesId: null,
    operationsId: null,

    /**
     * initializes a new class
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.name = args.name;
        this.stereotype = args.stereotype;
        this.isAbstract = "{ " + args.isAbstract + " }";
        this.attributes = args.attributes || {};
        this.operations = args.operations || {};
    },

    /**
     * creates and places a new class
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.nameId = this.htmlId + "Name";
        this.toolsId = this.htmlId + "Tools";
        this.titleId = this.htmlId + "Title";
        this.abstractId = this.htmlId + "Abstract";
        this.stereotypeId = this.htmlId + "Stereotype";
        this.attributesId = this.htmlId + "Attributes";
        this.operationsId = this.htmlId + "Operations";

        //test ids
        this.dragIconId = this.htmlId + "DragIcon";
        this.pinIconId = this.htmlId + "PinIcon";

        //place class into dom
        dojo.place(
            '<div class="Class" id="' + this.htmlId + '">' +
                '<div class="inner">' +
                    '<div class="toolbar" style="display: none;" id="' + this.toolsId + '">' +
                        '<div class="icon drag" id="' + this.dragIconId + '"></div>' +
                        '<div class="icon pin" id="' + this.pinIconId + '"></div>' +
                    '</div>' +
                    '<div class="title" id="' + this.titleId + '">' +
                        '<div class="stereotype" id="' + this.stereotypeId + '"></div>' +
                        '<div class="name" id="' + this.nameId + '"></div>' +
                        '<div class="abstract" id="' + this.abstractId + '"></div>' +
                    '</div>' +
                    '<div class="body">' +
                        '<div class="attributes" id="' + this.attributesId + '"></div>' +
                        '<div class="operations" id="' + this.operationsId + '"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //configure class
        this.setAbstract(this.isAbstract);
        this.setStereotype(this.stereotype);
        this.setName(this.name);

        //make class moveable
        this.dnd = new dojo.dnd.Moveable(this.htmlId, {
            handle: this.dragIconId
        });

        //select class on first move
        this.dnd.onFirstMove = dojo.hitch(this, function() {
            this.select(true);
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
    },

    /**
     * destroys the class
     */
    destroy: function() {
        this.stereotypeMenu.destroy(true);
        //this.operations
        //this.attributes

        this.inherited(arguments);
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
        //get toolbar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show toolbar
        if(toolBarNode) dojo.style(toolBarNode, "display", "");
    },

    /**
     * hides the toolbar
     */
    hideToolbar: function() {
        //get tool bar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show tool bar
        if(toolBarNode) dojo.style(toolBarNode, "display", "none");
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
        this.isAbstract = enable;

        if(this.isAbstract || abstractNode) {
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
     *
     * properties: {
     *  visibility: "public",
     *
     * }
     *
     * @param properties object
     */
    addOperation: function(properties) {
        var operation = new ui.classDiagram.Operation({
            placeAt: this.operationsId
        });

        if(!this.operations) this.operations = {};
        //TODO remove if already exists
        this.operations[operation.htmlId] = operation;
    },

    /**
     * removes a operation from the list
     * @param id string
     */
    removeOperation: function(id) {

    },

    /**
     * updates a operation
     * @param properties object
     */
    updateOperation: function(properties) {

    }
});

/**
 * a collection of components for an
 * operation, an attribute or a parameter
 */
dojo.declare("ui.classDiagram.Component", ui.Object, {
    visibilityMenu: null,
    visibilityId: null,

    /**
     * initializes components
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.create();
    },

    /**
     * sets the visibility of an
     * operation or an attribute
     *
     * possible types:
     *  - "public"
     *  - "protected"
     *  - "private"
     *  - "package"
     * @param type string
     */
    visibility: function(type) {
        //get node if already exists
        var node = dojo.byId(this.visibilityId);

        //create unique identifier
        if(!this.visibilityId) {
            this.visibilityId = this.htmlId + "Visibility";
        }

        //place component if doesn't exist
        if(type && !node) {
            dojo.place(
                '<div class="component visibility ' + type + '" id="' + this.visibilityId + '">+</div>',
                dojo.byId(this.placeAt)
            );

            //create context menu
            this.visibilityMenu = new ui.ContextMenu({
                title: "Visibility",
                buttons: [
                    {
                        icon: "test",
                        title: "public",
                        onClick: dojo.hitch(this, function(event) {
                            console.debug("mjau");
                        })
                    },
                    {
                        title: "protected",
                        onClick: dojo.hitch(this, function(event) {
                            console.debug("mjau");
                        })
                    },
                    {
                        title: "private",
                        onClick: dojo.hitch(this, function(event) {
                            console.debug("mjau");
                        })
                    },
                    {
                        title: "package",
                        onClick: dojo.hitch(this, function(event) {
                            console.debug("mjau");
                        })
                    }
                ]
            });

            this.visibilityMenu.create();
            this.visibilityMenu.register([this.visibilityId]);
        }

        //otherwise set new visibility type
        else if(type && node) {

        }

        //or hide visibility if no type is given
        else if(!type) {
            
        }

    },

    /**
     * destroys each registered event handler
     * and components with context menu
     */
    destroy: function() {
        //TODO destroy context menus and components

        this.inherited(arguments);
    }
});

/**
 * implementation of an operation
 */
dojo.declare("ui.classDiagram.Operation", ui.Object, {
    component: null,

    /**
     * initializes and creates operation
     * @param args
     */
    constructor: function(args) {
        args = args || {};

        //create and place operation entry
        this.create();
    },

    /**
     * places and creates operation
     */
    create: function() {
        this.inherited(arguments);

        //init components
        this.component = new ui.classDiagram.Component({
            placeAt: this.htmlId
        });

        //place operation
        dojo.place(
            '<div class="operation" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //configure component
        this.component.visibility("public");
    }
});
