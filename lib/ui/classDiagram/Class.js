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
    bodyId: null,
    titleId: null,
    toolsId: null,
    innerId: null,
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
        this.bodyId = this.htmlId + "Body";
        this.toolsId = this.htmlId + "Tools";
        this.titleId = this.htmlId + "Title";
        this.innerId = this.htmlId + "Inner";
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

        //console.debug(dojo.style(this.innerId, "width"));
        this.setSize();
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
        var innerNode = dojo.byId(this.innerId);
        var titleNode = dojo.byId(this.titleId);
        var bodyNode = dojo.byId(this.bodyId);

        if(innerNode) {
            var size = dojo.position(innerNode, true);
            if(titleNode) dojo.style(titleNode, "width", size.w + "px");
            if(bodyNode) dojo.style(bodyNode, "width", size.w + "px");
        }
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

/**
 * an icon component
 */
dojo.declare("ui.classDiagram.Icon", ui.Object, {
    menuStructure: null,
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
     *          description: "tooltip description"
     *      }
     *  ]
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.icon = args.icon;
        this.menuStructure = args.menu;
        //this.create();
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
    },

    /**
     * sets a new icon. if no param is
     * given it will hide the current
     * displayed icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        var node = dojo.byId(this.htmlId);

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
        this.icon = args.visibility;
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
 * implementation of an operation
 */
dojo.declare("ui.classDiagram.Operation", ui.Object, {
    visibility: null,
    name: null,

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
        this.visibility = new ui.classDiagram.Visibility({
            placeAt: this.htmlId,
            visibility: "public"
        });

        this.name = new ui.classDiagram.Name({
            placeAt: this.htmlId
        });

        //place operation
        dojo.place(
            '<div class="operation" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        this.visibility.create();
        this.name.create();
    }
});

/**
 * a text component
 */
dojo.declare("ui.classDiagram.Text", ui.Object, {
    lockDeactivation: null,
    menuStructure: null,
    editOnClick: null,
    isSelected: null,
    value: null,
    menu: null,

    //ids
    labelId: null,
    inputId: null,

    /**
     * initializes text component
     * args: {
     *  placeAt: "parent id",
     *  value: "default text",
     *  editOnClick: boolean,
     *  menu: context menu structure
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.value;
        this.menuStructure = args.menu;
        this.editOnClick = args.editOnClick;
    },

    /**
     * creates and places a new text input
     */
    create: function() {
        this.inherited(arguments);

        //create input id
        this.inputId = this.htmlId + "Input";
        this.labelId = this.htmlId + "Label";

        //create text input
        dojo.place(
            '<div class="component text" id="' + this.htmlId + '">' +
                '<div class="label" id="' + this.labelId + '"></div>' +
                '<input type="text" class="input" readonly="readonly" size="1" id="' + this.inputId + '" />' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //hide input
        this.select(false);

        //set value
        this.setValue(this.value);

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
        if(this.menuStructure) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.labelId]);
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
     * sets a new value
     * @param value string
     * @param force boolean if true the given value will written into input
     */
    setValue: function(value, force) {
        force = (typeof force == "boolean") ? force : true;
        this.value = value || "";

        //set as input value and label
        if(force) {
            var label = dojo.byId(this.labelId);
            label.innerHTML = value;
            var input = dojo.byId(this.inputId);
            input.value = value;
        }
    },

    /**
     * destroys input and context menu
     * @param del
     */
    destroy: function(del) {
        if(this.menu) this.menu.destroy();
        this.inherited(arguments);
    }
});

/**
 * name input
 */
dojo.declare("ui.classDiagram.Name", ui.classDiagram.Text, {
    /**
     * initializes name component
     * args: {
     *  placeAt: "parent id",
     *  name: "operation name"
     * }
     * @param args object
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.name || "operation";
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: "Operation Name",
            buttons: [
                {
                    icon: "edit",
                    title: "rename",
                    onClick: dojo.hitch(this, function(event) {
                        //lock deactivation once
                        this.lockDeactivation = true;
                        //show text input
                        this.select(true);
                    })
                }
            ]
        };

        //create name component
        this.inherited(arguments);
    }
});