/**
 * User: Christoph Grundmann
 * Date: 26.07.11
 * Time: 13:34
 * Dialog which gives access to
 * all round-trip engineering features
 */
dojo.provide("ui.dialog.Rte");
dojo.require("ui.Language");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.Rte", ui.Dialog, {
    language: null,
    diagram: null,

    /**
     * initializes dialog for the
     * access to each rte feature
     * args: {
     *  diagram: ui.content.ClassDiagram
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
        this.diagram = args.diagram;
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        //ok button isn't necessary
        this.hideOkButton();

        //create ids
        this.feBtnId = this.htmlId + "ForwardEngineeringButton";
        this.reBtnId = this.htmlId + "ReverseEngineeringButton";

        //show forward engineering button
        this.addContent("Forward Engineering",
            '<div class="description">' + this.language.FE_DESCRIPTION + '</div>' +
            '<div class="execButton left clear" id="' + this.feBtnId + '">' + this.language.FE_BUTTON + '</div>'
        );

        //show forward engineering button
        this.addContent("Reverse Engineering",
            '<div class="description">' + this.language.RE_DESCRIPTION + '</div>' +
            '<div class="execButton left clear" id="' + this.reBtnId + '">' + this.language.RE_BUTTON + '</div>'
        );

        //register button event listener
        this.connect({
            name: "ForwardEngineering",
            event: "onclick",
            nodeId: this.feBtnId,
            method: function(event) {
                this.diagram.generateJavaCode();
                this.close();
            }
        });

        this.connect({
            name: "ReverseEngineering",
            event: "onclick",
            nodeId: this.reBtnId,
            method: function(event) {
                this.diagram.generateDiagram();
                this.close();
            }
        });
    }
});

