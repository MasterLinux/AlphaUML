/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 16:21
 *
 */
dojo.provide("ui.dialog.AddOperation");
dojo.require("ui.dialog.AddParameter");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");
dojo.require("ui.List");

dojo.declare("ui.dialog.AddOperation", ui.Dialog, {
    addParameterDialog: null,
    editableOperation: null,
    parentClass: null,
    
    visibility: null,
    visibilityId: null,
    visibilityCntId: null,

    modifier: null,
    modifierId: null,
    modifierCntId: null,

    name: null,
    nameId: null,
    nameCntId: null,

    parameter: null,
    parameterId: null,
    parameterCntId: null,

    returnType: null,
    returnTypeId: null,
    returnTypeCntId: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   editableOperation
     *   parentClass
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.editableOperation = args.editableOperation;
        this.parentClass = args.parentClass;
    },

    /**
     * creats dialog
     */
    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //add preview
        this.javaPreviewId = this.htmlId + "JavaPreview";
        this.umlPreviewId = this.htmlId + "UMLPreview";
        this.addTablePreview(
            '<div class="row" id="' + this.umlPreviewId + '"></div>' +
            '<div class="row" id="' + this.javaPreviewId + '"></div>'
        );

        //add rows
        this.visibilityRow();
        this.modifierRow();
        this.returnTypeRow();
        //this.typeModifierRow(); TODO include
        this.nameRow();
        this.parameterRow();

        //set preview position
        dojo.publish("PreviewUpdate");
    },

    /**
     * destroys the dialog with
     * each content like text inputs
     * @param del
     */
    destroy: function(del) {
        if(this.addParameterDialog) this.addParameterDialog.close();
        if(this.visibility) this.visibility.destroy(true);
        if(this.modifier) this.modifier.destroy(true);
        if(this.name) this.name.destroy(true);
        if(this.returnType) this.returnType.destroy(true);
        if(this.parameter) this.parameter.destroy(true);
        //if(this.typeModifier) this.typeModifier.destroy(true); TODO implement
        
        this.inherited(arguments);
    },

    /**
     * creates a new operation if
     * the user approves the input
     * or updates the current one
     * @param event mouse event
     */
    onApprove: function(event) {
        var visibility = this.visibility.getValue();
        var modifier = this.modifier.getValue();
        var returnType = this.returnType.getValue();
        var name = this.name.getValue();

        //get parameter
        var parameter = null;
        dojo.forEach(this.parameter.entries, dojo.hitch(this, function(entry) {
            if(!parameter) parameter = [];
            parameter.push(entry.data);
        }));

        //edit operation
        if(this.editableOperation) {
            this.editableOperation.setVisibility(visibility);
            this.editableOperation.setModifier(modifier);
            this.editableOperation.setReturnType(returnType);
            this.editableOperation.setName(name);
            this.editableOperation.setParameter(parameter);
        }

        //create new operation
        else {
            //add a new attribute
            this.parentClass.addOperation({
                visibility: visibility,
                name: name,
                parameter: parameter,
                returnType: returnType,
                property: null, //TODO should it be implemented?
                modifier: modifier
            });
        }
    },

    /**
     * creates visibility row
     * @param value
     */
    visibilityRow: function(value) {
        //create unique identifier
        this.visibilityCntId = this.htmlId + "VisibilityContent";
        this.visibilityId = this.htmlId + "Visibility";

        //add new table row
        this.addTableRow({id: this.visibilityId});

        //add content into row
        this.addContent("Visibility", '<span id="' + this.visibilityCntId + '"></span>', this.visibilityId);

        //create visibility input field
        this.visibility = new ui.TextInput({
            placeAt: this.visibilityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "package";
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "public",
                    value: "public"
                },
                {
                    title: "protected",
                    value: "protected"
                },
                {
                    title: "private",
                    value: "private"
                }
            ]
        });

        this.visibility.create();

        //get configured value
        if(this.editableOperation) {
            //get value if exists
            var value = "";
            if(this.editableOperation.visibility)
                value = this.editableOperation.visibility.value;

            //get visibility
            if(value == "+") value = "public";
            else if(value == "#") value = "protected";
            else if(value == "-") value = "private";
            else if(value == "~") value = "";

            //set value
            this.visibility.setValue(value);
        }
    },

    /**
     * creates modifier row
     */
    modifierRow: function() {
        //create unique identifier
        this.modifierCntId = this.htmlId + "ModifierContent";
        this.modifierId = this.htmlId + "Modifier";

        //add new table row
        this.addTableRow({id: this.modifierId});

        //add content into row
        this.addContent("Modifier", '<span id="' + this.modifierCntId + '"></span>', this.modifierId);

        //create modifier input field
        this.modifier = new ui.TextInput({
            placeAt: this.modifierCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "static",
                    value: "static"
                },
                {
                    title: "final",
                    value: "final"
                },
                {
                    title: "abstract",
                    value: "abstract"
                }
            ]
        });

        this.modifier.create();

        //get configured value
        if(this.editableOperation) {
            this.modifier.setValue(this.editableOperation.modifier);
        }
    },

    /**
     * creates data type row
     */
    returnTypeRow: function() {
        //create unique identifier
        this.returnTypeCntId = this.htmlId + "ReturnTypeContent";
        this.returnTypeId = this.htmlId + "ReturnType";

        //add new table row
        this.addTableRow({id: this.returnTypeId});

        //add content into row
        this.addContent("Return Type", '<span id="' + this.returnTypeCntId + '"></span>', this.returnTypeId);

        //create modifier input field
        this.returnType = new ui.TextInput({
            placeAt: this.returnTypeCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "void";
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "void",
                    value: "void"
                },
                {
                    title: "boolean",
                    value: "boolean"
                },
                {
                    title: "byte",
                    value: "byte"
                },
                {
                    title: "char",
                    value: "char"
                },
                {
                    title: "double",
                    value: "double"
                },
                {
                    title: "float",
                    value: "float"
                },
                {
                    title: "int",
                    value: "int"
                },
                {
                    title: "long",
                    value: "long"
                },
                {
                    title: "short",
                    value: "short"
                }
            ]
        });

        //TODO add names of existing classes as options

        this.returnType.create();

        //get configured value
        if(this.editableOperation) {
            //get value if exists
            var value = "";
            if(this.editableOperation.returnType)
                value = this.editableOperation.returnType.value;

            //set value
            this.returnType.setValue(value);
        }
    },

    /**
     * creates name row
     */
    nameRow: function() {
        //create unique identifier
        this.nameCntId = this.htmlId + "NameContent";
        this.nameId = this.htmlId + "Name";

        //add new table row
        this.addTableRow({id: this.nameId});

        //add content into row
        this.addContent("Name", '<span id="' + this.nameCntId + '"></span>', this.nameId);

        //create name input field
        this.name = new ui.TextInput({
            placeAt: this.nameCntId,
            dynamicSize: true,
            minSize: 5,
            onChange: dojo.hitch(this, this.renderPreview),
            error: function(value) {
                //TODO allow error messages
                //if no data type is set display an error
                if(value === "") return true;
                else return false;
            },
            warning: function(value) {
                //TODO if data type doesn't exists display warning
            },
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "operation";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableOperation) {
            //get value if exists
            var value = "";
            if(this.editableOperation.name)
                value = this.editableOperation.name.value;

            //set value
            this.name.setValue(value);
        }

        //select name input
        this.name.select();
    },

    parameterRow: function() {
        //create unique identifier
        this.parameterCntId = this.htmlId + "ParameterContent";
        this.parameterId = this.htmlId + "Parameter";

        //add new table row
        this.addTableRow({id: this.parameterId});

        //add content into row
        this.addContent("Parameter", '<span id="' + this.parameterCntId + '"></span>', this.parameterId);

        //create parameter list
        this.parameter = new ui.List({
            placeAt: this.parameterCntId,
            onAdd: dojo.hitch(this, function(event) {
                //stop click bubbling
                dojo.stopEvent(event);
                
                //open dialog for creating a new parameter
                if(!this.addParameterDialog) {
                    //if dialog doesn't exists create a new one
                    this.addParameterDialog = new ui.dialog.AddParameter({
                        title: "Add Parameter (" + this.name.value + ")",
                        parentOperation: this,
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
            })
        });

        this.parameter.create();

        //get parameter list
        if(this.editableOperation && this.editableOperation.parameterList) {
            var list = this.editableOperation.parameterList;
            //create each parameter list entry
            for(var id in list) this.addParameter({
                name: list[id].name.value,
                dataType: list[id].dataType.value,
                multiplicity: list[id].multiplicity.value,
                property: list[id].property.value,
                modifier: list[id].modifier
            });
        }
    },

    /**
     * adds a new parameter
     * @param parameter
     */
    addParameter: function(parameter) {
        this.parameter.addEntry({
            title: parameter.name,
            onEdit: dojo.hitch(this, function(event, entry){
                //stop event bubbling
                dojo.stopEvent(event);
                //open edit dialog
                this.editParameter(entry);
            }),
            removable: true,
            data: {
                name: parameter.name,
                dataType: parameter.dataType,
                multiplicity: parameter.multiplicity,
                property: parameter.property,
                modifier: parameter.modifier
            }
        });

        //update preview
        this.renderPreview();
    },

    /**
     * edits a existing parameter
     * @param entry ui.ListEntry
     */
    editParameter: function(entry) {
        //create parameter dummy
        var _parameter = {
            //name tag
            name: { value: entry.data.name },
            setName: dojo.hitch(this, function(value) {
                entry.data.name = value;
                entry.setTitle(value);
            }),

            //data type tag
            dataType: { value: entry.data.dataType },
            setDataType: dojo.hitch(this, function(value) {
                entry.data.dataType = value;
            }),

            //multiplicity tag
            multiplicity: { value: entry.data.multiplicity },
            setMultiplicity: dojo.hitch(this, function(value) {
                entry.data.multiplicity = value;
            }),

            //property tag
            property: { value: entry.data.property },
            setProperty: dojo.hitch(this, function(value) {
                entry.data.property = value;
            }),
            
            //modifier tag
            modifier: entry.data.modifier,
            setModifier: dojo.hitch(this, function(value) {
                entry.data.modifier = value;
            })
        };

        //open dialog for editing a existing parameter
        if(!this.addParameterDialog) {
            //if dialog doesn't exists create a new one
            this.addParameterDialog = new ui.dialog.AddParameter({
                title: "Edit Parameter (" + entry.title + ")",
                editableParameter: _parameter,
                onSelect: dojo.hitch(this, function() {
                    this.select(true);
                }),
                onDestroy: dojo.hitch(this, function() {
                    //update preview
                    this.renderPreview();
                    //set instance var to null
                    this.addParameterDialog = null;
                })
            });

            this.addParameterDialog.create();
        } else {
            //otherwise select existing dialog
            this.addParameterDialog.select(true);
        }
    },

    /*
    this.parentOperation.addParameter({
        name: name,
        dataType: dataType,
        multiplicity: multiplicity,
        property: property,
        modifier: modifier
    });*/

    renderPreview: function() {
        var javaPreview = dojo.byId(this.javaPreviewId);
        var umlPreview = dojo.byId(this.umlPreviewId);

        var visibility = this.visibility ? this.visibility.getValue() : null;
        var modifier = this.modifier ? this.modifier.getValue() : null;
        var returnType = this.returnType ? this.returnType.getValue() : null;
        var name = this.name ? this.name.getValue() : null;

        var uml =
            '<span class="title">UML Notation: </span>' +
            '<span class="sample">' +
            (dojo.hitch(this, function(){
                //get uml visibility
                if(visibility == "public") return "+ ";
                else if(visibility == "protected") return "# ";
                else if(visibility == "private") return "- ";
                else return "~ ";
            }))() +
            name +
            (dojo.hitch(this, function(){
                var params = "";
                //get parameter list
                if(this.parameter) dojo.forEach(this.parameter.entries,
                    dojo.hitch(this, function(entry, index) {
                        var paramName = entry.data.name;
                        var paramDataType = entry.data.dataType;
                        var paramMultiplicity = entry.data.multiplicity;
                        var paramModifier = entry.data.modifier;

                        //add separator
                        if(index > 0) params += ", ";
                        //add parameter
                        params +=
                            paramName +
                            (paramDataType ? " : " + paramDataType : "") +
                            (paramMultiplicity ? " [" + paramMultiplicity.replace(/\[/g, "").replace(/\]/g, "") + "] " : "") +
                            (dojo.hitch(this, function(){
                                //get property
                                var _isFinal = paramModifier ? paramModifier.search(/final/g) : -1;
                                if(_isFinal !== -1) return " {readOnly}";
                                else return "";
                            }))();
                    })
                );

                return "(" + params + ")";
            }))() +
            (returnType ? " : " + returnType : "") +
            '</span>';

        //set uml preview
        umlPreview.innerHTML = uml;
        //set or unset underline if static
        var _isStatic = modifier ? modifier.search(/static/g) : -1;
        if(_isStatic !== -1) {
            //operation is static
            dojo.addClass(umlPreview, "static");
        } else {
            //operation isn't static
            dojo.removeClass(umlPreview, "static");
        }
        //set or unset underline if static
        var _isAbstract = modifier ? modifier.search(/abstract/g) : -1;
        if(_isAbstract !== -1) {
            //operation is abstract
            dojo.addClass(umlPreview, "abstract");
        } else {
            //operation isn't abstract
            dojo.removeClass(umlPreview, "abstract");
        }

        var java =
            '<span class="title">Java Notation: </span>' +
            '<span class="sample">' +
            (visibility && visibility != "package" ? visibility + " " : "") +
            (modifier ? modifier + " " : "") +
            (returnType ? returnType + " " : "") +
            //(multiplicity && multiplicity.search(/[(\.\.)\*]/g) !== -1  ? "[ ] " : " ") +
            name +
            (dojo.hitch(this, function(){
                var params = "";
                //get parameter list
                if(this.parameter) dojo.forEach(this.parameter.entries,
                    dojo.hitch(this, function(entry, index) {
                        var paramName = entry.data.name;
                        var paramDataType = entry.data.dataType;
                        var paramMultiplicity = entry.data.multiplicity;
                        var paramModifier = entry.data.modifier;

                        //add separator
                        if(index > 0) params += ", ";
                        //add parameter
                        params +=
                            (paramModifier ? paramModifier + " " : "") +
                            (paramDataType ? paramDataType : "") +
                            (paramMultiplicity && paramMultiplicity.search(/[(\.\.)\*]/g) !== -1  ? "[ ]" : " ") +
                            " " + paramName;
                    })
                );

                return "(" + params + ") {}";
            }))() +
            '</span>';

        //set java preview
        javaPreview.innerHTML = java;

        //update preview position
        dojo.publish("PreviewUpdate");
    }
});
