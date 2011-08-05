/**
 * User: Christoph Grundmann
 * Date: 04.08.11
 * Time: 00:07
 *
 */
dojo.provide("ui.dialog.AlphaUmlConfig");
dojo.require("ui.TextInput");
dojo.require("ui.Language");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.AlphaUmlConfig", ui.Dialog, {
    language: null,
    javacPathId: null,
    javaDocPathId: null,
    javacInput: null,
    javaDocInput: null,

    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        this.hideCancelButton();

        //create ids
        this.javacPathId = this.htmlId + "JavacPath";
        this.javaDocPathId = this.htmlId + "JavaDocPath";

        //show forward engineering button
        this.addContent("Java Compiler",
            '<div class="description">' + this.language.JAVAC_PATH_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.javacPathId + '"></div>'
        );

        //show forward engineering button
        this.addContent("JavaDoc",
            '<div class="description">' + this.language.JAVADOC_PATH_DESCRIPTION + '</div>' +
            '<div class="contentInput" id="' + this.javaDocPathId + '"></div>'
        );

        var javacPath = config.javac;
        var javaDocPath = config.javadoc;

        //create modifier input field
        this.javacInput = new ui.TextInput({
            placeAt: this.javacPathId,
            minSize: 15,
            onChange: dojo.hitch(this, function() {
                config.javac = this.javacInput.getValue();
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.javacInput.create();

        //add a new input button
        this.javacInput.addButton("open", null, dojo.hitch(this, function() {
            if(air) {
                var directory = air.File.documentsDirectory;

                try {
                    directory.browseForDirectory("Select Directory");
                    directory.addEventListener(air.Event.SELECT, dojo.hitch(this, function(event) {
                        this.javacInput.setValue(event.target.nativePath.replace(/\\/g, "/"));
                    }));
                }
                catch (error) {
                    //TODO show error
                    air.trace("Failed:", error.message);
                }
            }
        }));

        if(javacPath) this.javacInput.setValue(javacPath);

        //create modifier input field
        this.javaDocInput = new ui.TextInput({
            placeAt: this.javaDocPathId,
            minSize: 15,
            onChange: dojo.hitch(this, function() {
                config.javadoc = this.javaDocInput.getValue();
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.javaDocInput.create();

        //add a new input button
        this.javaDocInput.addButton("open", null, dojo.hitch(this, function() {
            if(air) {
                var directory = air.File.documentsDirectory;

                try {
                    directory.browseForDirectory("Select Directory");
                    directory.addEventListener(air.Event.SELECT, dojo.hitch(this, function(event) {
                        this.javaDocInput.setValue(event.target.nativePath.replace(/\\/g, "/"));
                    }));
                }
                catch (error) {
                    //TODO show error
                    air.trace("Failed:", error.message);
                }
            }
        }));

        if(javaDocPath) this.javaDocInput.setValue(javaDocPath);
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.javacInput) this.javacInput.destroy(true);
        if(this.javaDocInput) this.javaDocInput.destroy(true);
        this.inherited(arguments);
    }
});
