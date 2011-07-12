/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 16:21
 *
 */
dojo.provide("ui.dialog.AddOperation");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddOperation", ui.Dialog, {
    visibility: null,
    visibilityId: null,
    name: null,
    nameId: null,
    parameter: null,
    parameterId: null,
    returnType: null,
    returnTypeId: null,
    property: null,
    propertyId: null,

    //init values
    visibilityValue: null,
    parameterValue: null,
    returnTypeValue: null,
    propertyValue: null,
    nameValue: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   onExecute: function(properties) will be executed if the ok button will press
     *   visibility: string init value
     *   parameter: string init value
     *   returnType: string init value
     *   property: string init value
     *   name: string init value
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.visibilityValue = args.visibility;
        this.parameterValue = args.parameter;
        this.returnTypeValue = args.returnType;
        this.propertyValue = args.property;
        this.nameValue = args.name;
        this.onExecute = args.onExecute;
    },

    /**
     * creats dialog
     */
    create: function() {
        this.inherited(arguments);

        //create content
        this.addVisibility(this.visibilityValue);
        this.addName(this.nameValue);
        this.addParameter(this.parameterValue);
        this.addReturnType(this.returnTypeValue);
        this.addProperty(this.propertyValue);
    },

    /**
     * destroys the dialog with
     * each content like text inputs
     * @param del
     */
    destroy: function(del) {
        //this.parent.addOperationDialog = null;
        if(this.visibility) this.visibility.destroy(true);
        if(this.name) this.name.destroy(true);
        if(this.parameter) this.parameter.destroy(true);
        if(this.returnType) this.returnType.destroy(true);
        if(this.property) this.property.destroy(true);

        this.inherited(arguments);
    },

    /**
     * creates a new operation if
     * the user approves the input
     * @param event mouse event
     */
    onApprove: function(event) {
        if(this.onExecute) this.onExecute({
            visibility: this.visibility.getValue(),
            name: this.name.getValue(),
            parameter: undefined, //TODO implement parameter getValue,
            returnType: this.returnType.getValue(),
            property: this.property.getValue()
        });
    },

    addVisibility: function(value) {
        this.visibilityId = this.htmlId + "Visibility";

        this.addContent(
            "Visibility",
            '<span id="' + this.visibilityId + '"></span>'
        );

        this.visibility = new ui.TextInput({
            placeAt: this.visibilityId,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
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
                },
                {
                    title: "package",
                    value: "package"
                }
            ]
        });

        this.visibility.create();
        if(value) this.visibility.setValue(value);
    },

    addName: function(value) {
        this.nameId = this.htmlId + "Name";

        this.addContent(
            "Operation Name",
            '<span id="' + this.nameId + '"></span>'
        );

        this.name = new ui.TextInput({
            placeAt: this.nameId,
            value: "operation",
            valueFilter: function(value) {
                if(value === "") value = "operation"
                return value;
            },
            error: function(value) {
                //TODO allow error messages
                //if no name is set display an error
                if(value === "") return true;
                else return false;
            },
            warning: function(value) {
                //TODO if name already exists display warning
            }
        });

        this.name.create();
        if(value) this.name.setValue(value);
    },

    addParameter: function(value) {
        this.parameterId = this.htmlId + "Parameter";

        this.addContent(
            "Parameter",
            '<span id="' + this.parameterId + '"></span>'
        );

        //TODO implement parameter list
    },

    addReturnType: function(value) {
        this.returnTypeId = this.htmlId + "ReturnType";

        this.addContent(
            "Return Type",
            '<span id="' + this.returnTypeId + '"></span>'
        );

        this.returnType = new ui.TextInput({
            placeAt: this.returnTypeId,
            valueFilter: function(value) {
                if(value !== "") {
                    //if the user have use a not allowed character remove it
                    value = value.replace(/:/g, "");
                } else {
                    //on empty string return null
                    value = null;
                }
                return value;
            },
            options: [
                {
                    title: ":void",
                    value: "void"
                },
                {
                    title: ":boolean",
                    value: "boolean"
                },
                {
                    title: ":string",
                    value: "string"
                },
                {
                    title: ":char",
                    value: "char"
                }
            ]
        });

        this.returnType.create();
        if(value) this.returnType.setValue(value);
    },

    addProperty: function(value) {
        this.propertyId = this.htmlId + "Property";

        this.addContent(
            "Property",
            '<span id="' + this.propertyId + '"></span>'
        );

        this.property = new ui.TextInput({
            placeAt: this.propertyId,
            valueFilter: function(value) {
                if(value !== "") {
                    //if the user have use a not allowed character remove it
                    value = value.replace(/{/g, "").replace(/}/g, "");
                } else {
                    //on empty string return null
                    value = null;
                }
                
                return value;
            },
            options: [
                {
                    title: "{readOnly}",
                    value: "readOnly"
                },
                {
                    title: "{union}",
                    value: "union"
                },
                {
                    title: "{ordered}",
                    value: "ordered"
                },
                {
                    title: "{bag}",
                    value: "bag"
                }
            ]
        });

        this.property.create();
        if(value) this.property.setValue(value);
    }
});
