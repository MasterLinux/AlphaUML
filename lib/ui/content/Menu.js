/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.content.Menu");
dojo.require("ui.HMenu");
dojo.require("ui.Content");

dojo.declare("ui.content.Menu", ui.Content, {
    menu: null,

    /**
     * create unique id and
     * places the menu into DOM
     */
    create: function() {
        //create content container
        this.inherited(arguments);

        //modify the menu frame
        dojo.addClass(this.tabBarId, "stdOverflow");

        var fileMenu = this.createFileMenu();
        var searchMenu = this.createSearchMenu();
        var rteMenu = this.createRTEMenu();
        var structure = [fileMenu, rteMenu];

        this.menu = new ui.HMenu({
            placeAt: this.htmlId,
            structure: structure
        });

        this.menu.create();
    },

    createFileMenu: function() {
        var newProject = {
            title: "New Project",
            menu: null,
            onClick: function() {
                //console.debug(1);
            }
        };

        var openProject = {
            title: "Open Project",
            menu: null,
            onClick: function() {
                //console.debug(2);
            }
        };

        var menu = {
            title: "File",
            buttons: [newProject, openProject],
            onClick: function(){}
        };

        return menu;
    },

    createSearchMenu: function() {
        var find = {
            title: "Find",
            menu: null,
            onClick: function() {
                //console.debug(3);
            }
        };

        var replace = {
            title: "Replace",
            menu: null,
            onClick: function() {
                //console.debug(4);
            }
        };

        var menu = {
            title: "Search",
            buttons: [find, replace],
            onClick: function(){}
        };

        return menu;
    },

    createRTEMenu: function() {
        var m = this.createSearchMenu();
        var sm = new ui.HMenu({
            placeAt: this.htmlId,
            structure: [m]
        });
        var createClassDiagram = {
            title: "Class Diagram",
            menu: null,
            onClick: dojo.hitch(this, function() {
                /*
                var fileTree = this.getGlobal("FileTree");
                for(var id in fileTree) {
                    fileTree = fileTree[id];
                    break;
                } */

                var classDiagram = null;
                var diagrams = this.getGlobal("ClassDiagram");
                for(var id in diagrams) {
                    var diagram = diagrams[id];
                    if(diagram.isActivated) {
                        classDiagram = diagram;
                        break;
                    }
                }

                classDiagram.generateDiagram();
            })
        };

        var createJavaCode = {
            title: "Java Code",
            menu: null,
            onClick: function() {
                //console.debug(4);
            }
        };

        var menu = {
            title: "Create",
            buttons: [createClassDiagram, createJavaCode],
            onClick: function(){}
        };

        return menu;
    }
});
