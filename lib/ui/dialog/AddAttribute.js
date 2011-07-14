/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 16:21
 *
 */
dojo.provide("ui.dialog.AddAttribute");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddAttribute", ui.Dialog, {
    editableAttribute: null,
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

    dataType: null,
    dataTypeId: null,
    dataTypeCntId: null,

    multiplicity: null,
    multiplicityId: null,
    multiplicityCntId: null,

    defaultValue: null,
    defaultValueId: null,
    defaultValueCntId: null,

    javaPreviewId: null,
    umlPreviewId: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   editableAttribute:
     *   parentClass:
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.editableAttribute = args.editableAttribute;
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
        this.dataTypeRow();
        this.multiplicityRow();
        this.nameRow();
        this.defaultValueRow();
    },

    /**
     * destroys the dialog with
     * each content like text inputs
     * @param del
     */
    destroy: function(del) {
        if(this.visibility) this.visibility.destroy(true);
        if(this.name) this.name.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);


        this.inherited(arguments);
    },

    /**
     * creates a new attribute if
     * the user approves the input
     * or updates a current one
     * @param event mouse event
     */
    onApprove: function(event) {
        //get properties
        var visibility = this.visibility.getValue();
        var name = this.name.getValue();
        var dataType = this.dataType.getValue();
        var multiplicity = this.multiplicity.getValue();
        var defaultValue = this.defaultValue.getValue();
        var modifier = this.modifier.getValue();

        //is attribute final
        var _isFinal = modifier ? modifier.search(/final/g) : -1;
        var property = null;
        if(_isFinal !== -1) {
            //attribute is final
            property = "readOnly";
        }

        //edit attribute
        if(this.editableAttribute) {
            this.editableAttribute.setVisibility(visibility);
            this.editableAttribute.setName(name);
            this.editableAttribute.setDataType(dataType);
            this.editableAttribute.setMultiplicity(multiplicity);
            this.editableAttribute.setDefaultValue(defaultValue);
            this.editableAttribute.setProperty(property);
            this.editableAttribute.setModifier(modifier);
        }

        //create new attribute
        else {
            //add a new attribute
            this.parentClass.addAttribute({
                visibility: visibility,
                name: name,
                dataType: dataType,
                multiplicity: multiplicity,
                defaultValue: defaultValue,
                property: property,
                modifier: modifier
            });
        }
    },

    /**
     * creates visibility row
     */
    visibilityRow: function() {
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
        if(this.editableAttribute) {
            //get value if exists
            var value = "";
            if(this.editableAttribute.visibility)
                value = this.editableAttribute.visibility.value;

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
                    title: "final static",
                    value: "final static"
                }
            ]
        });

        this.modifier.create();

        //get configured value
        if(this.editableAttribute) {
            //TODO implement modifier correct
            this.modifier.setValue(this.editableAttribute.modifier);
        }
    },

    /**
     * creates data type row
     */
    dataTypeRow: function() {
        //create unique identifier
        this.dataTypeCntId = this.htmlId + "DataTypeContent";
        this.dataTypeId = this.htmlId + "DataType";

        //add new table row
        this.addTableRow({id: this.dataTypeId});

        //add content into row
        this.addContent("Data Type", '<span id="' + this.dataTypeCntId + '"></span>', this.dataTypeId);

        //create modifier input field
        this.dataType = new ui.TextInput({
            placeAt: this.dataTypeCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            warning: function(value) {
                //TODO if data type doesn't exists display warning
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
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

        this.dataType.create();

        //get configured value
        if(this.editableAttribute) {
            //get value if exists
            var value = "";
            if(this.editableAttribute.dataType)
                value = this.editableAttribute.dataType.value;

            //set value
            this.dataType.setValue(value);
        }
    },

    /**
     * creates multiplicity row
     */
    multiplicityRow: function() {
        //create unique identifier
        this.multiplicityCntId = this.htmlId + "MultiplicityContent";
        this.multiplicityId = this.htmlId + "Multiplicity";

        //add new table row
        this.addTableRow({id: this.multiplicityId});

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.multiplicityCntId + '"></span>', this.multiplicityId);

        //create modifier input field
        this.multiplicity = new ui.TextInput({
            placeAt: this.multiplicityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                //remove special characters
                if(value) value = value.replace(/\[/g, "").replace(/\]/g, "");
                //return value
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "[1]",
                    value: "[1]"
                },
                {
                    title: "[0..*]",
                    value: "[0..*]"
                }
            ]
        });

        this.multiplicity.create();

        //get configured value
        if(this.editableAttribute) {
            //get value if exists
            var value = "";
            if(this.editableAttribute.multiplicity)
                value = this.editableAttribute.multiplicity.value;

            //set value
            this.multiplicity.setValue(value);
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
                if(value === "") value = "attribute";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableAttribute) {
            //get value if exists
            var value = "";
            if(this.editableAttribute.name)
                value = this.editableAttribute.name.value;

            //set value
            this.name.setValue(value);
        }
    },

    /**
     * creates name row
     */
    defaultValueRow: function() {
        //create unique identifier
        this.defaultValueCntId = this.htmlId + "DefaultValueContent";
        this.defaultValueId = this.htmlId + "DefaultValue";

        //add new table row
        this.addTableRow({id: this.defaultValueId});

        //add content into row
        this.addContent("Initial Value", '<span id="' + this.defaultValueCntId + '"></span>', this.defaultValueId);

        //create name input field
        this.defaultValue = new ui.TextInput({
            placeAt: this.defaultValueCntId,
            dynamicSize: true,
            minSize: 5,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "";
                return value;
            }
        });

        this.defaultValue.create();

        //get configured value
        if(this.editableAttribute) {
            //get value if exists
            var value = "";
            if(this.editableAttribute.defaultValue)
                value = this.editableAttribute.defaultValue.value;

            //set value
            this.defaultValue.setValue(value);
        }
    },

    /**
     * renders the preview
     */
    renderPreview: function() {
        var javaPreview = dojo.byId(this.javaPreviewId);
        var umlPreview = dojo.byId(this.umlPreviewId);

        var visibility = this.visibility ? this.visibility.getValue() : null;
        var modifier = this.modifier ? this.modifier.getValue() : null;
        var dataType = this.dataType ? this.dataType.getValue() : null;
        var multiplicity = this.multiplicity ? this.multiplicity.getValue() : null;
        var name = this.name ? this.name.getValue() : null;
        var defaultValue = this.defaultValue ? this.defaultValue.getValue() : null;

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
            (dataType ? " : " + dataType : "") +
            (multiplicity ? " [" + multiplicity.replace(/\[/g, "").replace(/\]/g, "") + "] " : "") +
            (defaultValue ? "= " + defaultValue: "") +
            (dojo.hitch(this, function(){
                //get property
                var _isFinal = modifier ? modifier.search(/final/g) : -1;
                if(_isFinal !== -1) return " {readOnly}";
                else return "";
            }))() +
            '</span>';

        //set uml preview
        umlPreview.innerHTML = uml;
        //set or unset underline if static
        var _isStatic = modifier ? modifier.search(/static/g) : -1;
        if(_isStatic !== -1) {
            //attribute is static
            dojo.addClass(umlPreview, "static");
        } else {
            //attribute isn't static
            dojo.removeClass(umlPreview, "static");
        }
        

        var java =
            '<span class="title">Java Notation: </span>' +
            '<span class="sample">' +
            (visibility && visibility != "package" ? visibility + " " : "") +
            (modifier ? modifier + " " : "") +
            (dataType ? dataType : "") + //TODO Object as default??
            (multiplicity && multiplicity.search(/[(\.\.)\*]/g) !== -1  ? "[ ] " : " ") +
            name +
            (defaultValue ? " = " + defaultValue + ";" : ";") +
            '</span>';

        //set java preview
        javaPreview.innerHTML = java;
    }
});
