/**
 * User: Christoph Grundmann
 * Date: 07.08.11
 * Time: 23:28
 *
 */
dojo.provide("ui.dialog.NewFile");
dojo.require("ui.TextInput");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.NewFile", ui.Dialog, {
    folder: null,
    dataType: null,
    language: null,
    fileContent: null,
    filenameId: null,
    filenameInput: null,

    constructor: function(args) {
        args = args || {};
        this.folder = args.folder;
        this.dataType = args.dataType;
        this.fileContent = args.fileContent;
        this.language = new ui.Language();
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.filenameId = this.htmlId + "Filename";

        //show forward engineering button
        this.addContent("Filename",
            '<div class="description">' + this.language.FILENAME_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.filenameId + '"></div>'
        );

        //create filename input field
        this.filenameInput = new ui.TextInput({
            placeAt: this.filenameId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.filenameInput.create();
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.filenameInput) this.filenameInput.destroy(true);
        this.inherited(arguments);
    },

    /**
     * create new file in given folder
     */
    onApprove: function() {
        var name = this.filenameInput.getValue();
        if(name) {
            //check whether the file type already set, if not set it
            var expression = new RegExp("\." + this.dataType + "$");
            name = name.search(expression) !== -1 ? name : name + "." + this.dataType;

            //create new file if doesn't exists
            this.folder.createFile(name, this.fileContent);
        }
    }
});
