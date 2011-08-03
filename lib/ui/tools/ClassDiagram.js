/**
 * User: Christoph Grundmann
 * Date: 16.06.11
 * Time: 15:12
 *
 * menu for the editor
 */
dojo.provide("ui.tools.ClassDiagram");
dojo.require("ui.Language");
dojo.require("ui.Tools");

dojo.declare("ui.tools.ClassDiagram", ui.Tools, {
    language: null,

    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
    },

    /**
     * creates the editors context menu
     */
    create: function(placeAt) {
        var addClass = this.createAddClassBtn();
        var addGeneralization = this.createAddGeneralizationBtn();
        //var addComposition = this.createAddCompositionBtn();
        //var addAggregation = this.createAddAggregationBtn();
        var addAssociation = this.createAddAssociationBtn();
        var rte = this.createRoundTripBtn();
        var addNote = this.createAddNoteBtn();
        
        //declare buttons
        this.buttons = [
            addClass,
            addNote,
            addGeneralization,
            //addComposition,
            //addAggregation,
            addAssociation,
            rte
        ];

        //create menu
        this.inherited(arguments);
    },

    /**
     * creates a button for adding a new class
     */
    createAddClassBtn: function() {
        var diagram = this.tab.content;
        return {
            title: this.language.DIAGRAM_ADDBTN_CLASS,
            icon: "class",
            onClick: dojo.hitch(this, function() {
                //add class
                diagram.addClass();
            })
        }
    },

    createAddNoteBtn: function() {
        var diagram = this.tab.content;
        return {
            title: this.language.DIAGRAM_ADDBTN_NOTE,
            icon: "note",
            onClick: dojo.hitch(this, function() {
                //add class
                diagram.addNote();
            })
        }
    },

    createAddGeneralizationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: this.language.DIAGRAM_ADDBTN_GENERALIZATION,
            icon: "generalization",
            onClick: dojo.hitch(this, function() {
                diagram.addGeneralization();
            })
        }
    },

    createAddCompositionBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "Add Composition",
            icon: "composition",
            onClick: dojo.hitch(this, function() {
                diagram.addComposition();
            })
        }
    },

    createAddAggregationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "Add Aggregation",
            icon: "aggregation",
            onClick: dojo.hitch(this, function() {
                diagram.addAggregation();
            })
        }
    },

    createAddAssociationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: this.language.DIAGRAM_ADDBTN_ASSOCIATION,
            icon: "association",
            onClick: dojo.hitch(this, function() {
                diagram.addAssociation();
            })
        }
    },

    createRoundTripBtn: function() {
        var diagram = this.tab.content;
        return {
            title: this.language.DIAGRAM_ADDBTN_RTE,
            icon: "rte",
            onClick: dojo.hitch(this, function() {
                diagram.openRteDialog();
            })
        }
    }
});
