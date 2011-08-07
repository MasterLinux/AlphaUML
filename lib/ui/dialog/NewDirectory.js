/**
 * User: Christoph Grundmann
 * Date: 07.08.11
 * Time: 23:28
 *
 */
dojo.provide("ui.dialog.NewDirectory");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.NewDirectory", ui.Dialog, {
    folder: null,
    language: null,
    directoryNameId: null,
    directoryNameInput: null,

    constructor: function(args) {
        args = args || {};
        this.folder = args.folder;
        this.language = new ui.Language();
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.directoryNameId = this.htmlId + "DirectoryName";

        //show forward engineering button
        this.addContent("Directory Name",
            '<div class="description">' + this.language.DIRECTORYNAME_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.directoryNameId + '"></div>'
        );

        //create directory name input field
        this.directoryNameInput = new ui.TextInput({
            placeAt: this.directoryNameId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.directoryNameInput.create();
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.directoryNameInput) this.directoryNameInput.destroy(true);
        this.inherited(arguments);
    },

    /**
     * create new file in given folder
     */
    onApprove: function() {
        var name = this.directoryNameInput.getValue();
        if(name) {
            //create new folder if doesn't exists
            this.folder.createDirectory(name);
        }
    }
});
