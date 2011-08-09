/**
 * User: Christoph Grundmann
 * Date: 09.08.11
 * Time: 01:34
 *
 */
dojo.provide("ui.dialog.NewClassDiagram");
dojo.require("ui.TextInput");
dojo.require("ui.Dialog");
dojo.require("ui.Tab");
dojo.require("ui.content.ClassDiagram");
dojo.require("ui.tools.ClassDiagram");

dojo.declare("ui.dialog.NewClassDiagram", ui.Dialog, {
    language: null,
    nameId: null,
    nameInput: null,

    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.nameId = this.htmlId + "Name";

        //show forward engineering button
        this.addContent("Diagram Name",
            '<div class="description">' + this.language.CLASS_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.nameId + '"></div>'
        );

        //create filename input field
        this.nameInput = new ui.TextInput({
            placeAt: this.nameId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.nameInput.create();
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.nameInput) this.nameInput.destroy(true);
        this.inherited(arguments);
    },

    /**
     * create new file in given folder
     */
    onApprove: function() {
        var name = this.nameInput.getValue();
        if(name) {
            var topFrame = this.getGlobal("frame", null, "top");
            if(topFrame) {
                var diagram = new ui.Tab({
                    title: name,
                    content: new ui.content.ClassDiagram(),
                    menu: new ui.tools.ClassDiagram()
                });

                topFrame.tabBar.addTab(diagram, true);
            }
        }
    }
});
