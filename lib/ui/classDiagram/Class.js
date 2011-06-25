/**
 * User: Christoph Grundmann
 * Date: 21.06.11
 * Time: 16:42
 *
 */
dojo.provide("ui.classDiagram.Class");
dojo.require("ui.ContextMenu");
dojo.require("ui.Language");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.Class", ui.Object, {
    language: null,
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
    addAttributeBtnId: null,
    addOperationBtnId: null,

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
        this.language = new ui.Language();
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
        this.addAttributeBtnId = this.htmlId + "AddAttributeBtn";
        this.addOperationBtnId = this.htmlId + "AddOperationBtn";

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
                        '<div class="button" id="' + this.addAttributeBtnId + '">' + this.language.ADD_ATTRIBUTE_BTN + '</div>' +
                        '<div class="attributes" id="' + this.attributesId + '"></div>' +
                        '<div class="button" id="' + this.addOperationBtnId + '">' + this.language.ADD_OPERATION_BTN + '</div>' +
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

        //register add operation btn
        this.connect({
            name: "AddOperation",
            nodeId: this.addOperationBtnId,
            event: "onclick",
            method: function(event) {
                //TODO update
                this.addOperation();
            }
        });

        //register add operation btn
        this.connect({
            name: "AddAttribute",
            nodeId: this.addAttributeBtnId,
            event: "onclick",
            method: function(event) {
                //TODO update
                //this.addAttribute();
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
 * [Visibility] Name ([ParameterList]) [:ReturnType] [{Property}]
 */
dojo.declare("ui.classDiagram.Operation", ui.Object, {
    visibility: null,
    parameterList: null,
    returnType: null,
    property: null,
    name: null,

    //ids
    nameId: null,
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
        this.propertyId = this.htmlId + "Property";
        this.returnTypeId = this.htmlId + "ReturnType";
        this.visibilityId = this.htmlId + "Visibility";
        this.parameterListId = this.htmlId + "ParameterList";

        //init operation name
        this.name = new ui.classDiagram.Name({
            placeAt: this.nameId,
            type: "operation",
            component: this
        });

        //place operation
        dojo.place(
            '<div class="operation" id="' + this.htmlId + '">' +
                '<div style="float: left;" id="' + this.visibilityId + '"></div>' +
                '<div style="float: left;" id="' + this.nameId + '"></div>' +
                '<div style="float: left; padding: 2px;">(</div>' +
                '<div style="float: left;" id="' + this.parameterListId + '"></div>' +
                '<div style="float: left; padding: 2px;">)</div>' +
                '<div style="float: left;" id="' + this.returnTypeId + '"></div>' +
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
    addVisibility: function() {
        //create a new visibility tag
        if(!this.visibility) {
            //init visibility
            this.visibility = new ui.classDiagram.Visibility({
                placeAt: this.visibilityId,
                visibility: "public"
            });
        }

        //create tag
        this.visibility.create();
    },

    /**
     * adds a return type tag
     */
    addReturnType: function() {
        //create return type tag
        if(!this.returnType) {
            //init return type
            this.returnType = new ui.classDiagram.ReturnType({
                placeAt: this.returnTypeId
            });
        }

        //create tag
        this.returnType.create();
    },

    /**
     * adds a property tag
     */
    addProperty: function() {
        //create property tag
        if(!this.property) {
            //init property
            this.property = new ui.classDiagram.Property({
               placeAt: this.propertyId
            });
        }

        //create tag
        this.property.create();
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
        this.isSet = true;
    },

    /**
     * creates a new icon with
     * context menu 
     */
    create: function() {
        this.inherited(arguments);

        //create icon
        if(!dojo.byId(this.htmlId)) {
            dojo.place(
                '<div class="component icon" id="' + this.htmlId + '"></div>',
                dojo.byId(this.placeAt)
            );
        }

        //add icon
        this.setIcon(this.icon);

        //create a new context menu
        if(this.menuStructure && !this.menu) {
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create();
            this.menu.register([this.htmlId]);
        }

        //activate icon
        if(!this.isSet) {
            this.activate();
            this.isSet = true;
        }
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

        //set icon
        if(node && icon) {
            dojo.attr(node, "class", "component icon " + icon);
            dojo.style(node, "display", "");
        }

        //hide icon
        else if(node && !icon) {
            dojo.style(node, "display", "none");
            this.deactivate();
            this.isSet = false;
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
                    title: "Remove",
                    onClick: dojo.hitch(this, function(event) {
                        this.setIcon();
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
     *  menu: context menu structure
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.value = args.value;
        this.defaultValue = args.defaultValue;
        this.menuStructure = args.menu;
        this.editOnClick = args.editOnClick;
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
                        '<div class="tag" id="' + this.endTagId + '"></div>' +
                        '<input type="text" class="input" readonly="readonly" size="1" id="' + this.inputId + '" />' +
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
            this.isSet = true;
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

                //deactivate input
                this.isSet = false;
                this.deactivate();
            }
                     
            else {
                //show default value instead
                this.setValue(this.defaultValue);
            }
        }
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
            if(!this.value) this.value = this.type;
        }

        //otherwise set up attribute
        else if(this.type == "attribute") {
            this.menuTitle = "Attribute";
            if(!this.value) this.value = this.type;
        }

        //set default value
        this.defaultValue = this.value;
    },

    /**
     * creates name component with
     * context menu
     */
    create: function() {
        //create context menu
        this.menuStructure = {
            title: this.menuTitle,
            buttons: [
                {
                    icon: "edit",
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
                        //destroy component
                        this.component.destroy(true);
                    })
                },
                {
                    title: "Add Visibility",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addVisibility();
                    })
                },
                {
                    title: "Add Return Type",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addReturnType();
                    })
                },
                {
                    title: "Add Property",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addProperty();
                    })
                },
                {
                    title: "Add Parameter",
                    onClick: dojo.hitch(this, function(event) {
                        this.component.addParameter();
                    })
                }
            ]
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
                        this.setValue();
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
                        this.setValue();
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