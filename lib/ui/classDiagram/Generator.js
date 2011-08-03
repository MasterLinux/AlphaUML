/**
 * User: Christoph Grundmann
 * Date: 22.07.11
 * Time: 17:36
 *
 * generates a class diagram with the help
 * of java files
 */
dojo.provide("ui.classDiagram.Generator");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.classDiagram.Class");
dojo.require("ui.Language");
dojo.require("lib.JavaParser");

dojo.declare("ui.classDiagram.Generator", null, {
    parser: null,
    diagram: null,
    filePaths: null,
    language: null,

    /**
     * initializes generator
     * args: {
     *   diagram: ui.content.ClassDiagram,
     *   filePath: array of file paths
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.diagram = args.diagram;
        this.filePaths = args.filePaths;
        this.language = new ui.Language();
        this.parser = new lib.JavaParser({
            diagram: this.diagram
        });
    },

    /**
     * generates classes
     * @param msgFunc a function, which displays a onscreen message
     */
    generator: function(filePaths, msgFunc) {
        //storage for generalizations
        var generalization = [];
        //storage for provided interfaces
        var providedInterfaces = [];
        //stores each class name for creation of associations
        var classNames = [];

        //parse java files
        this.parser.parse(filePaths, dojo.hitch(this, function(javaFiles) {
            //iterate files
            dojo.forEach(javaFiles, dojo.hitch(this, function(file) {
                //iterate classes of the current file
                dojo.forEach(file["classes"], dojo.hitch(this, function(c) {
                    if(msgFunc) msgFunc(this.language.CLASSDIAGRAM_GEN_CLASS + c["name"]);

                    classNames.push(c["name"]);

                    //store relation (generalization)
                    if(c["extend"]) generalization.push({
                        superclass: c["extend"],
                        subclass: c["name"]
                    });

                    //store relations (provided interfaces)
                    if(c["implement"].length > 0) providedInterfaces.push({
                        interfaces: c["implement"],
                        subclass: c["name"]
                    });

                    //TODO get @uml tag and use position and diagram name of it if exists

                    //get @umlPos tag
                    var javaDoc = c["javaDoc"];

                    var umlIgnore = null;
                    var umlProject = null;
                    var umlTitle = null;
                    var description = null;
                    var x = 20, y = 20;
                    var noteX = 20, noteY = 20;
                    if(javaDoc) {
                        var _desc = javaDoc["description"];
                        if(_desc) description = _desc["description"];

                        var umlPos = javaDoc["umlPos"];
                        if(umlPos && umlPos.length > 0) {
                            var pos = umlPos[0];
                            x = parseInt(pos["x"] || 20);
                            y = parseInt(pos["y"] || 20);
                        }

                        var umlNotePos = javaDoc["umlNotePos"];
                        if(umlNotePos && umlNotePos.length > 0) {
                            var notePos = umlNotePos[0];
                            noteX = parseInt(notePos["x"] || 20);
                            noteY = parseInt(notePos["y"] || 20);
                        }

                        var _umlIgnore = javaDoc["umlIgnore"];
                        if(_umlIgnore) dojo.forEach(_umlIgnore, dojo.hitch(this, function(i) {
                            if(!umlIgnore) umlIgnore = [];
                            umlIgnore.push(i["path"]);
                        }));

                        var _umlProject = javaDoc["umlProject"];
                        if(_umlProject && _umlProject.length > 0) {
                            var project = _umlProject[0];
                            umlProject = {
                                root: project["root"],
                                main: project["main"]
                            }
                        }

                        var _umlTitle = javaDoc["umlTitle"];
                        if(_umlTitle && _umlTitle.length > 0) {
                            var title = _umlTitle[0];
                            umlTitle = title["title"];
                        }
                    }

                    if(umlTitle) {
                        this.diagram.tab.setTitle(umlTitle);
                    }

                    var _class = new ui.classDiagram.Class({
                        placeAt: this.diagram.areaId,
                        _imports: file["imports"],
                        _package: file["package"],
                        diagram: this.diagram,
                        name: c["name"],
                        x: x,
                        y: y
                    });

                    if(c["type"] === "interface" || c["type"] === "enumeration") {
                        _class.setStereotype(c["type"]);
                    }
                    
                    //get modifier and abstract state
                    var isAbstract = false;
                    dojo.forEach(c["modifier"], dojo.hitch(this, function(m, idx, arr) {
                        if(m == "abstract") isAbstract = true;
                        var last = arr.length -1;

                        if(!_class.modifier) _class.modifier = m;
                        else _class.modifier += m;

                        if(idx != last) _class.modifier += " ";
                    }));

                    _class.setAbstract(isAbstract);

                    _class.visibility = c["visibility"];

                    //place class into diagram
                    _class.create();

                    //store class
                    this.diagram.registerClass(_class);

                    //create note for javadoc comment
                    if(description) {
                        var _note = new ui.classDiagram.Note({
                            placeAt: this.diagram.areaId,
                            diagram: this.diagram,
                            x: noteX,
                            y: noteY
                        });

                        _note.create();

                        _note.setComment(description);

                        //store note
                        this.diagram.registerNote(_note);

                        //initialize connector
                        var connector = new ui.classDiagram.NoteConnector({
                            placeAt: this.diagram.areaId,
                            diagram: this.diagram
                        });

                        //place connector
                        connector.create();

                        //register classes
                        connector.registerClass(
                            _class, "p0",
                            _note, "p1"
                        );

                        //store connector
                        this.diagram.connectors.push(connector); //TODO could be the reason for errors create register and remove functions
                    }                                    

                    var body = c["body"];

                    //add attributes
                    dojo.forEach(body["variable"], dojo.hitch(this, function(v) {
                        //create modifier and property value
                        var modifier = null;
                        var property = null;
                        dojo.forEach(v["modifier"], dojo.hitch(this, function(m, idx, arr) {
                            if(m == "final") property = "readOnly";
                            //init modifier as string
                            if(!modifier) modifier = "";

                            //create modifier
                            modifier += m;

                            //add separator
                            if(idx !== (arr.length-1)) {
                                modifier += " ";
                            }
                        }));

                        //create dataType
                        var dataType = v["dataType"];
                        if(v["generic"]) dataType += "<" + v["generic"] + ">";
                        if(v["array"]) dataType += "[]";

                        _class.addAttribute({
                            visibility: v["visibility"],
                            name: v["name"],
                            dataType: dataType,
                            //multiplicity: properties.multiplicity,
                            defaultValue: v["value"],
                            property: property,
                            modifier: modifier
                        });
                    }));

                    //add operations
                    dojo.forEach(body["method"], dojo.hitch(this, function(m) {
                        //create modifier
                        var modifier = null;
                        dojo.forEach(m["modifier"], dojo.hitch(this, function(m, idx, arr) {
                            //init modifier as string
                            if(!modifier) modifier = "";

                            //create modifier
                            modifier += m;

                            //add separator
                            if(idx !== (arr.length-1)) {
                                modifier += " ";
                            }
                        }));

                        //create dataType
                        var isConstructor = false;
                        var dataType = m["dataType"] !== "constructor" ? m["dataType"] : (dojo.hitch(this, function() {
                            isConstructor = true;
                            return null;
                        }))();
                        if(dataType && m["generic"]) dataType += "<" + m["generic"] + ">";
                        if(dataType && m["array"]) dataType += "[]";

                        //get parameter
                        var parameter = null;
                        dojo.forEach(m["parameter"], dojo.hitch(this, function(p) {
                            if(!parameter) parameter = [];

                            //create modifier and property value
                            var modifier = null;
                            var property = null;
                            dojo.forEach(p["modifier"], dojo.hitch(this, function(m, idx, arr) {
                                if(m == "final") property = "readOnly";
                                //init modifier as string
                                if(!modifier) modifier = "";

                                //create modifier
                                modifier += m;

                                //add separator
                                if(idx !== (arr.length-1)) {
                                    modifier += " ";
                                }
                            }));

                            //create dataType
                            var dataType = p["dataType"];
                            if(p["generic"]) dataType += "<" + p["generic"] + ">";
                            if(p["array"]) dataType += "[]";

                            parameter.push({
                                name: p["name"],
                                dataType: dataType,
                                //multiplicity:
                                property: property,
                                modifier: modifier
                            });
                        }));

                        //create operation with parameter
                        _class.addOperation({
                            isConstructor: isConstructor,
                            visibility: m["visibility"],
                            name: m["name"],
                            returnType: dataType,
                            parameter: parameter,
                            modifier: modifier,
                            body: m["body"]
                        });
                    }));
                }));
            }));

            //show message
            if(msgFunc) msgFunc(this.language.CLASSDIAGRAM_GEN_CONNECTORS);

            //create generalizations
            dojo.forEach(generalization, dojo.hitch(this, function(g) {
                var superclass = this.diagram.getClass(g.superclass);
                var subclass = this.diagram.getClass(g.subclass);

                if(superclass && subclass) {
                    //initialize connector
                    var connector = new ui.classDiagram.Generalization({
                        placeAt: this.diagram.areaId,
                        diagram: this.diagram
                    });

                    //place connector
                    connector.create();

                    //register classes
                    connector.registerClass(
                        superclass, "p0",
                        subclass, "p1"
                    );

                    //store connector
                    this.diagram.connectors.push(connector);
                }
            }));

            //set provided interfaces
            dojo.forEach(providedInterfaces, dojo.hitch(this, function(p) {
                var subclass = this.diagram.getClass(p.subclass);

                dojo.forEach(p.interfaces, dojo.hitch(this, function(i) {
                    var _interface = this.diagram.getClass(i);

                    if(_interface && subclass) {
                        //initialize connector
                        var connector = new ui.classDiagram.Generalization({
                            placeAt: this.diagram.areaId,
                            diagram: this.diagram,
                            isInterface: true
                        });

                        //place connector
                        connector.create();

                        //register classes
                        connector.registerClass(
                            _interface, "p0",
                            subclass, "p1"
                        );

                        //store connector
                        this.diagram.connectors.push(connector);
                    }
                }));
            }));

            //set associations and required interfaces
            var alreadyCreated = [];
            dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
                var instances = [];

                //iterate attributes of current class
                for(var id in c.attributes) {
                    var isInstance = false;
                    var attribute = c.attributes[id];
                    var dataType = attribute.dataType.getDataType();

                    //is instance of an existing class
                    dojo.forEach(classNames, dojo.hitch(this, function(name) {
                        var ignore = false;
                        
                        //if already created ignore this step
                        dojo.forEach(alreadyCreated, dojo.hitch(this, function(i) {
                            if(i.className === c.name && i.attributeName === attribute.name.value)
                                ignore = true;
                        }));

                        if(dataType === name && !ignore) isInstance = true;
                    }));

                    //store instance
                    if(isInstance) instances.push(attribute);
                }

                //get each info for associations
                dojo.forEach(instances, dojo.hitch(this, function(i) {
                    var instanceClass = this.diagram.getClass(i.dataType.getDataType());

                    if(instanceClass) {
                        //check for bidirectional associations
                        var iAttributes = instanceClass.attributes;
                        var iInstance = null;
                        for(var id in iAttributes) {
                            var attribute = iAttributes[id];
                            var dataType = attribute.dataType.getDataType();

                            //if true its a bidirectional association
                            if(dataType == c.name) {
                                //register as already created, so it will create only once
                                alreadyCreated.push({
                                    className: instanceClass.name,
                                    attributeName: attribute.name.value
                                });

                                iInstance = attribute;
                                break;
                            }
                        }

                        /*
                        //store each necessary info
                        associations.push({
                            leftClass: c,
                            leftAttribute: i,
                            rightClass: instanceClass,
                            rightAttribute: iInstance
                        })*/

                        //create association or required interface
                        //get direction
                        var direction = null;
                        if(i && iInstance) {
                            direction = "both";
                        } else if(i && !iInstance) {
                            direction = "p1";
                        } else if(!i && iInstance) {
                            direction = "p0";
                        }

                        //create association
                        var connector = null;
                        if(instanceClass.stereotype !== "interface") {
                            //get visibilities
                            var leftRoleVisibility = iInstance ? iInstance.visibility.getVisibility() : null;
                            var rightRoleVisibility = i ? i.visibility.getVisibility() : null;

                            //get roles
                            var leftRole = iInstance ? iInstance.name.value : null;
                            var rightRole = i ? i.name.value : null;

                            //get multiplicity
                            var leftMultiplicity = null;
                            var rightMultiplicity = null;

                            if(iInstance && iInstance.dataType.value && iInstance.dataType.value.search(/\[/) !== -1) {
                                leftMultiplicity = "[0..*]";
                            }

                            if(i && i.dataType.value && i.dataType.value.search(/\[/) !== -1) {
                                rightMultiplicity = "[0..*]";
                            }

                            //initialize connector
                            connector = new ui.classDiagram.Association({
                                diagram: this.diagram,
                                placeAt: this.diagram.areaId,
                                direction: direction,
                                p0RoleVisibility: leftRoleVisibility,
                                p0Multiplicity: leftMultiplicity,
                                p0Role: leftRole,
                                p1RoleVisibility: rightRoleVisibility,
                                p1Multiplicity: rightMultiplicity,
                                p1Role: rightRole,
                                name: null
                            });

                            //place connector
                            connector.create();

                            //register classes
                            connector.registerClass(
                                c, "p0",
                                instanceClass, "p1"
                            );
                        }

                        else {
                            //otherwise create required interface
                            connector = new ui.classDiagram.Association({
                                isInterface: true,
                                diagram: this.diagram,
                                placeAt: this.diagram.areaId,
                                name: "&lt;&lt;use&gt;&gt;"
                            });

                            //place connector
                            connector.create();

                            //register classes
                            connector.registerClass(
                                instanceClass, "p0",
                                c, "p1"
                            );
                        }
                        
                        //store connector
                        this.diagram.connectors.push(connector);

                        //destroy attributes, 'cause they aren't necessary
                        if(iInstance) iInstance.destroy(true);
                        if(i) i.destroy(true);
                    }
                }));
            }));

            //show ready message
            if(msgFunc) msgFunc(this.language.CLASSDIAGRAM_GEN_READY, false, "success");
            //remove message
            if(msgFunc) msgFunc(null, true);
        }));
    }
});
