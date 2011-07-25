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
dojo.require("lib.JavaParser");

dojo.declare("ui.classDiagram.Generator", null, {
    parser: null,
    diagram: null,
    filePaths: null,

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
        this.parser = new lib.JavaParser();
    },

    /**
     * generates classes
     */
    generator: function(filePaths) {
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
                    var _class = new ui.classDiagram.Class({
                        placeAt: this.diagram.areaId,
                        _imports: file["imports"],
                        _package: file["package"],
                        name: c["name"],
                        x: 40,
                        y: 40
                    });

                    _class.setStereotype(c["type"]);

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
                    this.diagram.addClass(_class);

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
                        var dataType = m["dataType"] !== "constructor" ? m["dataType"] : null;
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
                            visibility: m["visibility"],
                            name: m["name"],
                            returnType: dataType,
                            parameter: parameter,
                            modifier: modifier
                        });
                    }));
                }));
            }));

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
                    }
                }));
            }));
        }));
    }
});
