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
        var addGeneralization = this.createAddGeneralization();
        
        //declare buttons
        this.buttons = [addClass, addGeneralization];

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

    createAddGeneralization: function() {
        var diagram = this.tab.content;
        return {
            title: "New Generalization",
            icon: "generalization",
            onClick: dojo.hitch(this, function() {
                //add class
                diagram.addGeneralization();
            })
        }
    }
});
