/**
 * User: Christoph Grundmann
 * Date: 19.06.11
 * Time: 16:05
 *
 * implementation of a class diagram area
 */
dojo.provide("ui.content.ClassDiagram");
dojo.require("ui.content.Scrollable");
dojo.require("ui.classDiagram.Note");
dojo.require("ui.classDiagram.Class");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.classDiagram.Generator");
dojo.require("ui.Language");
dojo.require("ui.MouseInfo");
dojo.require("ui.dialog.Rte");
dojo.require("ui.dialog.AddClass");
dojo.require("ui.dialog.AddGeneralization");
dojo.require("ui.dialog.AddAssociation");
dojo.require("ui.dialog.AddProvidedInterface");
dojo.require("ui.dialog.AddRequiredInterface");
dojo.require("ui.content.Editor");
dojo.require("ui.tools.Editor");
dojo.require("lib.JavaGenerator");

dojo.declare("ui.content.ClassDiagram", ui.content.Scrollable, {
    addClassDialog: null,
    notes: null,
    classes: null,
    connectors: null,
    mouseInfo: null,
    language: null,

    constructor: function(args){
        args = args || {};
        this.notes = [];
        this.classes = [];
        this.connectors = [];
        this.language = new ui.Language();
    },

    create: function() {
        this.inherited(arguments);

        //store class diagram global
        this.setGlobal("ClassDiagram");

        //register shortcuts
        this.connect({
            name: "Keyboard",
            event: "onkeyup",
            body: true,
            method: function(event) {
                //f2 key
                if(event.keyCode == 113) {
                    dojo.stopEvent(event);
                    this.addClass();
                }
            }
        });
    },

    activate: function() {
        dojo.forEach(this.classes, function(c) {
           c.activate();
        });

        dojo.forEach(this.connectors, function(c) {
           c.activate();
        });

        dojo.forEach(this.notes, function(n) {
           n.activate();
        });

        this.inherited(arguments);
    },

    deactivate: function() {
        this.inherited(arguments);

        dojo.forEach(this.classes, function(c) {
           c.deactivate();
        });

        dojo.forEach(this.connectors, function(c) {
           c.deactivate();
        });

        dojo.forEach(this.notes, function(n) {
           n.deactivate();
        });
    },

    /**
     * activates the routine for
     * adding a new class into the
     * diagram. a mouse info will
     * show and after a click at
     * the working area the class
     * will be drawn
     */
    addClass: function() {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //open dialog
        if(!this.addClassDialog) {
            //create new mouse info
            this.mouseInfo = new ui.MouseInfo({
                title: this.language.DIAGRAM_ADD_CLASS,
                icon: "class",
                onClickArea: this.areaId,
                onClick: dojo.hitch(this, function(event) {
                    //add new class into the workspace area of this content
                    if(this.areaId == event.target.id) {
                            //display add class dialog
                            this.addClassDialog = new ui.dialog.AddClass({
                                title: "New Class",
                                diagram: this,
                                classX: event.offsetX,
                                classY: event.offsetY,
                                onDestroy: dojo.hitch(this, function() {
                                    //set instance var to null
                                    this.addClassDialog = null;
                                })
                            });
                            //create dialog
                            this.addClassDialog.create();
                    }

                    //destroy mouse info
                    this.mouseInfo.destroy(true);
                    this.mouseInfo = null;
                })
            });

            //place mouse info
            this.mouseInfo.create();
        }

        //otherwise select existing dialog
        else this.addClassDialog.select(true);
    },

    addNote: function() {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //create new mouse info
        this.mouseInfo = new ui.MouseInfo({
            title: this.language.DIAGRAM_ADD_CLASS,
            icon: "note",
            onClickArea: this.areaId,
            onClick: dojo.hitch(this, function(event) {
                //add new note into the workspace area of this content
                if(this.areaId == event.target.id) {
                    //init note
                    var note = new ui.classDiagram.Note({
                        placeAt: this.areaId,
                        diagram: this,
                        x: event.offsetX,
                        y: event.offsetY
                    });

                    //place new class
                    note.create();

                    //store class
                    this.notes.push(note);
                }

                //destroy mouse info
                this.mouseInfo.destroy(true);
                this.mouseInfo = null;
            })
        });

        //place mouse info
        this.mouseInfo.create();
    },

    /**
     * starts a specific connector tool
     * properties: {
     *   startIcon: string mouse info icon
     *   startTitle: string mouse info title
     *   endIcon: string mouse info icon
     *   endTitle: string mouse info title
     *   type: string connector type
     *   direction: string "p0", "p1" or "both"
     * }
     * @param properties
     */
    addConnector: function(properties) {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //create new mouse info
        this.mouseInfo = new ui.MouseInfo({
            title: properties.startTitle,
            icon: properties.startIcon,
            onClickUiType: "class",
            onClick: dojo.hitch(this, function(event, uiObject) {
                //set superclass
                var superclass = uiObject;

                //destroy mouse info
                this.mouseInfo.destroy();
                this.mouseInfo = null;

                //create mouse info for the subclass
                this.mouseInfo = new ui.MouseInfo({
                    title: properties.endTitle,
                    icon: properties.endIcon,
                    onClickUiType: "class",
                    onClick: dojo.hitch(this, function(event, uiObject) {
                        //set subclass
                        var subclass = uiObject;

                        //check whether interfaces selected
                        var isNote = false;
                        var hasInterface = false;
                        var bothInterface = false;
                        var superIsInterface = superclass.stereotype == "interface";
                        var subIsInterface = subclass.stereotype == "interface";
                        var superIsNote = superclass.isNote;
                        var subIsNote = subclass.isNote;
                        if(superIsInterface || subIsInterface) {
                            hasInterface = true;
                        }
                        if(superIsInterface && subIsInterface) {
                            bothInterface = true;
                        }
                        if(superIsNote || subIsNote) {
                            isNote = true;
                        }

                        //create generalization
                        if(properties.type == "Generalization" && (!hasInterface || bothInterface)) {
                            //open dialog
                            if(!this.addClassDialog) {
                                this.addClassDialog = new ui.dialog.AddGeneralization({
                                    title: "Generalization",
                                    diagram: this,
                                    superclass: superclass,
                                    subclass: subclass,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.addClassDialog = null;
                                    })
                                });

                                this.addClassDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.addClassDialog.select(true);
                            }
                        }

                        //create provided interface
                        else if(properties.type == "Generalization" && hasInterface) {
                            //select interface
                            var _interface, _subInterface;
                            if(superIsInterface) {
                                _interface = superclass;
                                _subInterface = subclass;
                            } else {
                                _interface = subclass;
                                _subInterface = superclass;
                            }
                            
                            //open dialog
                            if(!this.addClassDialog) {
                                this.addClassDialog = new ui.dialog.AddProvidedInterface({
                                    title: "Provided Interface",
                                    diagram: this,
                                    interfaces: _interface,
                                    subclass: _subInterface,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.addClassDialog = null;
                                    })
                                });

                                this.addClassDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.addClassDialog.select(true);
                            }
                        }

                        //create association
                        if(properties.type == "Association" && !hasInterface && !isNote) {
                            //open dialog
                            if(!this.addClassDialog) {
                                this.addClassDialog = new ui.dialog.AddAssociation({
                                    title: "Association",
                                    diagram: this,
                                    leftClass: superclass,
                                    rightClass: subclass,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.addClassDialog = null;
                                    })
                                });

                                this.addClassDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.addClassDialog.select(true);
                            }
                        }

                        //connect required interface
                        else if(properties.type == "Association" && hasInterface && !isNote) {
                            //select interface
                            var _interface, _subInterface;
                            if(superIsInterface) {
                                _interface = superclass;
                                _subInterface = subclass;
                            } else {
                                _interface = subclass;
                                _subInterface = superclass;
                            }

                            //open dialog
                            if(!this.addClassDialog) {
                                this.addClassDialog = new ui.dialog.AddRequiredInterface({
                                    title: "Required Interface",
                                    diagram: this,
                                    interfaces: _interface,
                                    subclass: _subInterface,
                                    onDestroy: dojo.hitch(this, function() {
                                        //set instance var to null
                                        this.addClassDialog = null;
                                    })
                                });

                                this.addClassDialog.create();
                            } else {
                                //otherwise select existing dialog
                                this.addClassDialog.select(true);
                            }
                        }

                        //add note connector
                        else if(properties.type == "Association" && isNote) {
                            //initialize connector
                            var connector = new ui.classDiagram.NoteConnector({
                                placeAt: this.areaId,
                                diagram: this
                            });

                            //place connector
                            connector.create();

                            //register classes
                            connector.registerClass(
                                superclass, "p0",
                                subclass, "p1"
                            );

                            //store connector
                            this.connectors.push(connector);
                        }

                        /*
                        var connector;
                        if(properties.type == "Association") {
                            //initialize connector
                            connector = new ui.classDiagram.Association({
                                placeAt: this.areaId,
                                direction: properties.direction
                            });
                        }

                        //TODO ask for other types
                        else {
                            //initialize connector
                            connector = new ui.classDiagram.Connector({
                                placeAt: this.areaId,
                                type: properties.type,
                                direction: properties.direction
                            });
                        }

                        //place connector
                        connector.create();

                        //register classes
                        connector.registerClass(superclass, "p0", subclass, "p1");

                        //store connector
                        this.connectors.push(connector);
                        */

                        //destroy mouse info
                        this.mouseInfo.destroy();
                        this.mouseInfo = null;
                    })
                });

                //place mouse info
                this.mouseInfo.create();
            })
        });

        //place mouse info
        this.mouseInfo.create();
    },

    /**
     * enables the "add generalization" tool
     */
    addGeneralization: function() {
        this.addConnector({
            startIcon: "generalization",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "generalization",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Generalization"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addComposition: function() {
        this.addConnector({
            startIcon: "composition",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "composition",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Composition"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addAggregation: function() {
        this.addConnector({
            startIcon: "aggregation",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "aggregation",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Aggregation"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addAssociation: function() {
        this.addConnector({
            startIcon: "association",
            startTitle: this.language.DIAGRAM_ADD_ASSOCIATION_FIRST,
            endIcon: "association",
            endTitle: this.language.DIAGRAM_ADD_ASSOCIATION_SECOND,
            type: "Association"
        });
    },

    /**
     * generates java source code with the
     * help of the class diagram
     */
    generateJavaCode: function() {
        var gen = new lib.JavaGenerator({
            classes: this.classes,
            diagram: this
        });

        //generate java files/source
        var files = gen.generator();

        //get frame to open each file in it
        var frame = this.getGlobal("frame", null, "bottom");

        //create tabs
        if(frame) dojo.forEach(files, dojo.hitch(this, function(f, idx, arr) {
            var editor = new ui.Tab({
                title: f.fileName,
                content: new ui.content.Editor(),
                menu: new ui.tools.Editor()
            });

            //add tab into frame
            frame.tabBar.addTab(editor, false);

            //set generated source
            editor.content.setSource(f.source);
            //initialize editor
            editor.content.setEditorEvents();
            
            editor.setAccent(true);
        }));
    },

    /**
     * generates a class diagram with
     * the help of java source code
     */
    generateDiagram: function() {
        var frame = this.getGlobal("frame", this.tabBarId);
        if(frame) {
            frame.showMessage(this.language.CLASSDIAGRAM_GEN_START, true, "warning");
            frame.showMessage(this.language.CLASSDIAGRAM_GEN_PARSE, true);
        }

        //clear diagram
        this.clearDiagram();

        //get java files of the current project
        var sources = [];
        if(air) {
            var fileTree = this.getGlobal("filetree", null, "master");
            sources = fileTree.getJavaFiles();
        } else {
            sources = [
                "FileTreeTest/test1/test1.java",
                "FileTreeTest/test2/test2.java",
                "FileTreeTest/test2/test2_1/test1.java",
                "FileTreeTest/test1/wikiFile.java"
            ]
        }

        var gen = new ui.classDiagram.Generator({
            diagram: this
        });

        //generates diagram
        gen.generator(sources, dojo.hitch(this, function(msg, del, msgType) {
            if(!del && frame) frame.showMessage(msg, true, msgType);
            else if(frame) frame.removeMessage();
        }));
    },

    /**
     * opens a dialog to get access on
     * the forward and reverse engineering
     * processes
     */
    openRteDialog: function() {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);
        
        if(!this.addClassDialog) {
            this.addClassDialog = new ui.dialog.Rte({
                title: "Round Trip Engineering",
                diagram: this,
                onDestroy: dojo.hitch(this, function() {
                    //set instance var to null
                    this.addClassDialog = null;
                })
            });
            
            this.addClassDialog.create();
        } else {
            //otherwise select existing dialog
            this.addClassDialog.select(true);
        }
    },

    /**
     * gets class by name
     * @param name string
     */
    getClass: function(name) {
        var _class = null;
        dojo.forEach(this.classes, dojo.hitch(this, function(c) {
            if(c.name == name) _class = c;
        }));
        return _class;
    },

    /**
     * registers a class into class storage
     * @param c ui.classDiagram.Class
     */
    registerClass: function(c, name, index) {
        name = name || c.name;
        index = index || 2;

        //add class if doesn't exists
        if(!this.getClass(c.name)) {
            this.classes.push(c);
        }

        //otherwise change name and try again
        else {
            c.setName(name + "_" + index);
            this.addClass(c, name, ++index);
        }
    },

    /**
     * removes a class by name
     * @param name
     */
    removeClass: function(name) {
        var _classes = [];
        dojo.forEach(this.classes, dojo.hitch(this, function(c) {
            if(c.name !== name) _classes.push(c);
        }));
        this.classes = _classes;
    },

    /**
     * registers a new note
     * @param note ui.classDiagram.Note
     */
    registerNote: function(note) {
        if(!this.notes) this.notes = [];
        this.notes.push(note);
    },

    /**
     * removes a note from storage
     * @param id string htmlId
     */
    removeNote: function(id) {
        var _notes = [];
        if(this.notes) dojo.forEach(this.notes, dojo.hitch(this, function(note) {
            if(note.htmlId != id) _notes.push(note);
        }));
        this.notes = _notes;
    },

    /**
     * removes a connector by its htmlId
     * @param id string htmlId
     */
    removeConnector: function(id) {
        var _con = [];
        if(this.connectors) dojo.forEach(this.connectors, dojo.hitch(this, function(con) {
            if(con.htmlId != id) _con.push(con);
        }));
        this.connectors = _con;
    },

    /**
     * removes each class, which
     * will also destroy each connector
     */
    clearDiagram: function() {
        if(this.classes) {
            dojo.forEach(this.classes, dojo.hitch(this, function(c) {
                c.destroy(true);
            }));
        }

        if(this.notes) {
            dojo.forEach(this.notes, dojo.hitch(this, function(n) {
                n.destroy(true);
            }));
        }
    }
});
