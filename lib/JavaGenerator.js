/**
 * User: Christoph Grundmann
 * Date: 07.07.11
 * Time: 11:20
 *
 * generates java code from a
 * list of classes
 */
dojo.provide("lib.JavaGenerator");
dojo.require("ui.Language");
dojo.require("ui.Object");

dojo.declare("lib.JavaGenerator", ui.Object, {
    language: null,
    classes: null,
    diagram: null,

    //special characters
    TAB: "\t",

    /**
     * initializes generator
     * args: {
     *   classes: array of ui.classDiagram.Class
     * }
     * @param args object
     */
    constructor: function(args) {
        this.language = new ui.Language();
        this.classes = args.classes;
        this.diagram = args.diagram;
    },

    generator: function(msgFunc) {
        var files = [];
        
        //iterates classes and create classes
        dojo.forEach(this.classes, dojo.hitch(this, function(c) {
            var structure = c.getJSON();
            var fileName = "";
            var java = "";

            if(structure["package"]) java += "package " + structure["package"] + ";\n\n";

            dojo.forEach(structure["imports"], dojo.hitch(this, function(i, idx, arr) {
                java += "import " + i + ";\n";
                if(idx === arr.length - 1) java += "\n";
            }));

            //create classes
            dojo.forEach(structure["classes"], dojo.hitch(this, function(structure) {
                if(msgFunc) msgFunc(this.language.JAVA_GEN_CLASS + structure["name"]);
                //create file name
                fileName = structure["name"] + ".java";

                //TODO implement JavaDoc
                var javaDoc = structure["javaDoc"];
                var _javaDoc = structure["_javaDoc"];
                if(javaDoc) {
                    java += "/**\n";

                    //set javadoc comment
                    var comment = javaDoc["description"];
                    if(comment) {
                        var desc = comment["description"].split("\n");
                        dojo.forEach(desc, dojo.hitch(this, function(line, idx, arr) {
                            if((line !== "" && idx === 0) || idx > 0) {
                                java += " * " + line + "\n";
                            }

                            //add newline at the end of the comments
                            if(idx === arr.length-1) {
                                java += " *\n";
                            }
                        }));
                    }

                    //store diagram title
                    var title = this.diagram.tab.title;
                    java += " * @umlTitle " + title + "\n";

                    //store class position
                    var umlPos = javaDoc["umlPos"];
                    if(umlPos) {
                        var pos = umlPos[0];
                        java += " * @umlPos x:" + pos["x"];
                        java += " y:" + pos["y"] + "\n";
                    }

                    //store note position
                    var umlNotePos = javaDoc["umlNotePos"];
                    if(umlNotePos) {
                        var notePos = umlNotePos[0];
                        java += " * @umlNotePos x:" + notePos["x"];
                        java += " y:" + notePos["y"] + "\n";
                    }

                    //ignored files
                    var fileTree = this.getGlobal("filetree", null, "master");
                    if(fileTree) {
                        var ignoredFiles = fileTree.getJavaFiles(true, true);
                        dojo.forEach(ignoredFiles, dojo.hitch(this, function(path) {
                            java += " * @umlIgnore " + path + "\n";
                        }));
                    }
                }
                
                //usual javaDoc
                if(_javaDoc) {
                    //set @param tag
                    if(_javaDoc["atParam"]) dojo.forEach(_javaDoc["atParam"], dojo.hitch(this, function(param) {
                        var desc = param["description"].replace(/^(\s+)/, "").replace(/(\s+)$/, "").split("\n");
                        java += " * @param " + param["name"] + " ";
                        dojo.forEach(desc, dojo.hitch(this, function(d, idx) {
                            if(idx === 0) java += d + "\n";
                            else java += this.TAB + " * " + d + "\n";
                        }));
                    }));

                    if(_javaDoc["atReturn"]) dojo.forEach(_javaDoc["atReturn"], dojo.hitch(this, function(param) {
                        java += " * @return " + param["description"] + "\n";
                    }));

                    if(_javaDoc["atThrows"]) dojo.forEach(_javaDoc["atThrows"], dojo.hitch(this, function(param) {
                        java += " * @throws " + param["classname"] + " " + param["description"] + "\n";
                    }));

                    if(_javaDoc["atException"]) dojo.forEach(_javaDoc["atException"], dojo.hitch(this, function(param) {
                        java += " * @exception " + param["classname"] + " " + param["description"] + "\n";
                    }));

                    if(_javaDoc["atSince"]) dojo.forEach(_javaDoc["atSince"], dojo.hitch(this, function(param) {
                        java += " * @since " + param["description"] + "\n";
                    }));

                    if(_javaDoc["atAuthor"]) dojo.forEach(_javaDoc["atAuthor"], dojo.hitch(this, function(param) {
                        java += " * @author " + param["description"] + "\n";
                    }));

                    if(_javaDoc["atSee"]) dojo.forEach(_javaDoc["atSee"], dojo.hitch(this, function(param) {
                        java += " * @see " + param["description"] + "\n";
                    }));
                }

                //set end tag
                if(javaDoc || _javaDoc) java += " */\n";

                //[visibility] [modifier] type name [extends] [implements] { body }
                if(structure["visibility"]) java += structure["visibility"] + " ";

                dojo.forEach(structure["modifier"], dojo.hitch(this, function(m) {
                    java += m + " ";
                }));

                //class, interface or enum
                java += structure["type"] + " ";

                java += structure["name"] + " ";

                //set superclasses
                if(structure["extend"]) java += "extends " + structure["extend"] + " ";

                //set interfaces
                dojo.forEach(structure["implement"], dojo.hitch(this, function(i, idx, arr) {
                    if(idx === 0) java += "implements ";

                    //add interface name
                    java += i;

                    //add separator
                    if(idx !== arr.length - 1) java += ", ";
                    else java += " ";
                }));

                //set body start
                java += "{\n";

                var body = structure["body"];

                //set attributes [visibility] [modifier] dataType[<generic>][array] name [=value] ;
                dojo.forEach(body["variable"], dojo.hitch(this, function(v, idx, arr) {
                    //TODO add JavaDoc

                    //add tabulator
                    java += this.TAB;

                    if(v["visibility"]) java += v["visibility"] + " ";

                    dojo.forEach(v["modifier"], dojo.hitch(this, function(m) {
                        java += m + " ";
                    }));

                    java += v["dataType"];
                    if(v["generic"]) java += "<" + v["generic"] + ">";
                    if(v["array"]) java += "[]";
                    java += " ";

                    java += v["name"];

                    //set " or ' if value/data type is a String or char
                    var isString = false;
                    var isChar = false;
                    var value = v["value"];
                    if(v["dataType"] == "String") isString = true;
                    if(v["dataType"] == "char") isChar = true;
                    if(isString && v["value"]) value = '"' + v["value"] + '"';
                    else if(isChar && v["value"]) value = "'" + v["value"] + "'";

                    //set initial value
                    if(value) java += " = " + value;

                    //add semicolon
                    if(idx === arr.length - 1) java += ";\n\n";
                    else java += ";\n";
                }));

                //set operations [visibility] [modifier] dataType[<generic>][array] name ([parameter]) [{] [body] [}]
                dojo.forEach(body["method"], dojo.hitch(this, function(m, idx, arr) {
                    var isAbstract = false;

                    //JavaDoc
                    var javaDoc = m["javaDoc"];
                    if(javaDoc) {
                        //start tag
                        java += this.TAB + "/**\n";

                        var description = javaDoc.getDescription();
                        dojo.forEach(description, dojo.hitch(this, function(line) {
                            java += this.TAB + " * " + line + "\n";
                        }));

                        //set @param tag
                        if(javaDoc["atParam"]) dojo.forEach(javaDoc["atParam"], dojo.hitch(this, function(param) {
                            var desc = param["description"].replace(/^(\s+)/, "").replace(/(\s+)$/, "").split("\n");
                            java += this.TAB + " * @param " + param["name"] + " ";
                            dojo.forEach(desc, dojo.hitch(this, function(d, idx) {
                                if(idx === 0) java += d + "\n";
                                else java += this.TAB + " * " + d + "\n";
                            }));
                        }));

                        if(javaDoc["atReturn"]) dojo.forEach(javaDoc["atReturn"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @return " + param["description"] + "\n";
                        }));

                        if(javaDoc["atThrows"]) dojo.forEach(javaDoc["atThrows"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @throws " + param["classname"] + " " + param["description"] + "\n";
                        }));

                        if(javaDoc["atException"]) dojo.forEach(javaDoc["atException"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @exception " + param["classname"] + " " + param["description"] + "\n";
                        }));

                        if(javaDoc["atSince"]) dojo.forEach(javaDoc["atSince"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @since " + param["description"] + "\n";
                        }));

                        if(javaDoc["atAuthor"]) dojo.forEach(javaDoc["atAuthor"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @author " + param["description"] + "\n";
                        }));

                        if(javaDoc["atSee"]) dojo.forEach(javaDoc["atSee"], dojo.hitch(this, function(param) {
                            java += this.TAB + " * @see " + param["description"] + "\n";
                        }));

                        //end tag
                        java += this.TAB + " */\n";
                    }

                    //add tabulator
                    java += this.TAB;

                    if(m["visibility"]) java += m["visibility"] + " ";

                    dojo.forEach(m["modifier"], dojo.hitch(this, function(m) {
                        if(m == "abstract") isAbstract = true;
                        java += m + " ";
                    }));

                    if(!m["isConstructor"] || m["name"] !== structure["name"]) {
                        java += m["dataType"];
                        if(m["generic"]) java += "<" + m["generic"] + ">";
                        if(m["array"]) java += "[]";
                        java += " ";
                    }

                    java += m["name"];

                    java += "(";

                    //add parameter [modifier] dataType[<generic>][array] name
                    dojo.forEach(m["parameter"], dojo.hitch(this, function(param, idx, arr) {
                        dojo.forEach(param["modifier"], dojo.hitch(this, function(m) {
                            java += m + " ";
                        }));

                        java += param["dataType"];
                        if(param["generic"]) java += "<" + param["generic"] + ">";
                        if(param["array"]) java += "[]";
                        java += " ";

                        java += param["name"];

                        //add separator
                        if(idx !== arr.length-1) java += ", ";
                    }));

                    java += ")";

                    //set method body
                    if(!isAbstract) {
                        java += " {";

                        if(m["body"]) java += m["body"];

                        java += "}";
                    }

                    //otherwise set semicolon
                    else {
                        java += ";"
                    }

                    //add body end
                    java += "\n\n";
                }));

                //set body end
                java += "}\n";
            }));

            //store generated class as file
            files.push({
                fileName: fileName,
                source: java
            });
        }));

        return files;
    }

});

