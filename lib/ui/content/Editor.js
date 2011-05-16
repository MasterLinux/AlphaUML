/**
 * User: Christoph Grundmann
 * Date: 16.05.11
 * Time: 15:37
 *
 */
dojo.provide("ui.content.Editor");
dojo.require("ui.Content");

dojo.declare("ui.content.Editor", ui.Content, {
    editor: null,
    javaMode: null,

    create: function() {
        //set code editor container
        this.content = '<pre id="codeEditor">test testestetestsetestestestestsetestestset</pre>';

        //create content container
        this.inherited(arguments);

        //initialize and create ace editor
        this.editor = ace.edit("codeEditor");

        //set color theme
        this.editor.setTheme("ace/theme/eclipse");

        //get java mode
        this.javaMode = require("ace/mode/java").Mode;

        //set java mode
        this.editor.getSession().setMode(new this.javaMode());

        console.debug(this.editor);
    }
});

