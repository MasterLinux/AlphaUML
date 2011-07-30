/**
 * User: Christoph Grundmann
 * Date: 16.06.11
 * Time: 15:12
 *
 * menu for the editor
 */
dojo.provide("ui.tools.ClassDiagram");
dojo.require("ui.Tools");

dojo.declare("ui.tools.ClassDiagram", ui.Tools, {
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
            addGeneralization,
            //addComposition,
            //addAggregation,
            addAssociation,
            rte,
            addNote
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
            title: "New Class",
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
            title: "New Note",
            icon: "class",
            onClick: dojo.hitch(this, function() {
                //add class
                diagram.addNote();
            })
        }
    },

    createAddGeneralizationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "New Generalization",
            icon: "generalization",
            onClick: dojo.hitch(this, function() {
                diagram.addGeneralization();
            })
        }
    },

    createAddCompositionBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "New Composition",
            icon: "composition",
            onClick: dojo.hitch(this, function() {
                diagram.addComposition();
            })
        }
    },

    createAddAggregationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "New Aggregation",
            icon: "aggregation",
            onClick: dojo.hitch(this, function() {
                diagram.addAggregation();
            })
        }
    },

    createAddAssociationBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "New Association",
            icon: "association",
            onClick: dojo.hitch(this, function() {
                diagram.addAssociation();
            })
        }
    },

    createRoundTripBtn: function() {
        var diagram = this.tab.content;
        return {
            title: "Round Trip Engineering",
            icon: "rte",
            onClick: dojo.hitch(this, function() {
                diagram.openRteDialog();
            })
        }
    }
});
