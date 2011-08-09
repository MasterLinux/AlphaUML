/**
 * User: Christoph Grundmann
 * Date: 08.08.11
 * Time: 22:36
 *
 */
dojo.provide("ui.dialog.NewProject");
dojo.require("ui.TextInput");
dojo.require("ui.Language");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.NewProject", ui.Dialog, {
    language: null,
    projectNameId: null,
    projectNameInput: null,
    projectRootId: null,
    projectRootInput: null,

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
        this.projectNameId = this.htmlId + "ProjectName";
        this.projectRootId = this.htmlId + "ProjectRoot";

        //show forward engineering button
        this.addContent("Project Name",
            '<div class="description">' + this.language.PROJECT_NAME_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.projectNameId + '"></div>'
        );

        //show forward engineering button
        this.addContent("Project Root",
            '<div class="description">' + this.language.PROJECT_ROOT_PATH_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.projectRootId + '"></div>'
        );

        //create modifier input field
        this.projectNameInput = new ui.TextInput({
            placeAt: this.projectNameId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "AlphaUMLProject";
                return value;
            }
        });

        this.projectNameInput.create();

        //create modifier input field
        this.projectRootInput = new ui.TextInput({
            placeAt: this.projectRootId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.projectRootInput.create();

        //add a new input button
        this.projectRootInput.addButton("folder", null, dojo.hitch(this, function() {
            if(air) {
                var directory = air.File.documentsDirectory;

                try {
                    directory.browseForDirectory("Select Directory");
                    directory.addEventListener(air.Event.SELECT, dojo.hitch(this, function(event) {
                        this.projectRootInput.setValue(event.target.nativePath.replace(/\\/g, "/"));
                    }));
                }
                catch (error) {
                    //TODO show error
                    air.trace("Failed:", error.message);
                }
            }
        }));
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.projectNameInput) this.projectNameInput.destroy(true);
        if(this.projectRootInput) this.projectRootInput.destroy(true);
        this.inherited(arguments);
    },

    /**
     * creates a new project folder and opens it
     */
    onApprove: function() {
        var fileTree = this.getGlobal("filetree", null, "master");
        if(fileTree) {
            var path = this.projectRootInput.getValue();
            var name = this.projectNameInput.getValue();

            //create folder
            var folder = fileTree.createDirectory(name, path);

            if(folder) {
                //create source folder
                fileTree.createDirectory("src", folder.url);
                //open project folder
                fileTree.getDirectory(folder);
                fileTree.createView();
            }
        }
    }
});

