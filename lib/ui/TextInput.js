/**
 * User: Christoph Grundmann
 * Date: 02.05.11
 * Time: 15:00
 *
 */

dojo.provide("ui.TextInput");
dojo.require("ui.Object");

dojo.declare("ui.TextInput", ui.Object, {
    buttonId: null,
    inputId: null,
    options: null,
    type: null,

    constructor: function(args) {
        this.buttonId = this.htmlId + 'Button';
        this.inputId = this.htmlId + 'Input';
        this.options = args.options || [];
        this.type = args.type || 'text';
    },

    create: function() {
        //execute method of super class
        this.inherited(arguments);

        dojo.place(
            '<div id="' + this.htmlId + '">' +
                '<input id="' + this.inputId + '" type="' + this.type + '" />' +
                '<div id="' + this.buttonId + '" class="DropDownButton"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );
    },

    /**
     * gets the current set value
     * of this text input
     */
    value: function() {
        return dojo.byId(this.inputId).value;
    }
});