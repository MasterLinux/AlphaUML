/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.content.Menu");
dojo.require("ui.dialog.NewClassDiagram");
dojo.require("ui.dialog.AlphaUmlConfig");
dojo.require("ui.dialog.NewProject");
dojo.require("ui.HMenu");
dojo.require("ui.Content");

dojo.declare("ui.content.Menu", ui.Content, {
    configDialog: null,
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
        var createMenu = this.createCreateMenu();
        //var rteMenu = this.createRTEMenu();
        var structure = [fileMenu, createMenu];

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
                //open config dialog
                if(!this.configDialog) {
                    this.configDialog = new ui.dialog.NewProject({
                        title: "New Project",
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.configDialog = null;
                        })
                    });

                    this.configDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.configDialog.select(true);
                }
            }
        };

        var openProject = {
            title: "Open Project",
            menu: null,
            onClick: function() {
                if(air) {
                    var directory = air.File.documentsDirectory;

                    try {
                        directory.browseForDirectory("Select Directory");
                        directory.addEventListener(air.Event.SELECT, dojo.hitch(this, function(event) {
                            //get file tree
                            var fileTree = this.getGlobal("filetree", null, "master");
                            
                            //open selected directory
                            fileTree.getDirectory(event.target);

                            //create new file tree
                            fileTree.createView();
                        }));
                    }
                    catch (error) {
                        //TODO show error
                        air.trace("Failed:", error.message)
                    }
                }
            }
        };

        var configAlphaUML = {
            title: "Options",
            menu: null,
            onClick: function() {
                //open config dialog
                if(!this.configDialog) {
                    this.configDialog = new ui.dialog.AlphaUmlConfig({
                        title: "Configure AlphaUML",
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.configDialog = null;
                        })
                    });

                    this.configDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.configDialog.select(true);
                }
            }
        };

        var menu = {
            title: "File",
            buttons: [newProject, openProject, configAlphaUML],
            onClick: function(){}
        };

        return menu;
    },

    createCreateMenu: function() {
        var classDiagram = {
            title: "Class Diagram",
            menu: null,
            onClick: function() {
                //open config dialog
                if(!this.configDialog) {
                    this.configDialog = new ui.dialog.NewClassDiagram({
                        title: "New Class Diagram",
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.configDialog = null;
                        })
                    });

                    this.configDialog.create();
                } else {
                    //otherwise select existing dialog
                    this.configDialog.select(true);
                }
            }
        };

        var menu = {
            title: "Create",
            buttons: [classDiagram],
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
