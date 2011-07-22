/**
 * User: Christoph Grundmann
 * Date: 07.07.11
 * Time: 11:20
 *
 * generates java code from a
 * list of classes
 */
dojo.provide("lib.JavaGenerator");

dojo.declare("lib.JavaGenerator", null, {
    classes: null,

    //special characters
    TAB: "     ",

    /**
     * initializes generator
     * args: {
     *   classes: array of ui.classDiagram.Class
     * }
     * @param args object
     */
    constructor: function(args) {
        this.classes = args.classes;
    },

    generator: function() {
        var files = [];
        
        //iterates classes and create classes
        dojo.forEach(this.classes, dojo.hitch(this, function(c) {
            var structure = c.getJSON();
            var java = "";

            if(structure["package"]) java += structure["package"] + "\n\n";

            dojo.forEach(structure["imports"], dojo.hitch(this, function(i, idx, arr) {
                java += i + "\n";
                if(idx === arr.length - 1) java += "\n";
            }));

            //create classes
            dojo.forEach(structure["classes"], dojo.hitch(this, function(structure) {
                //TODO implement JavaDoc

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

                    //TODO set " or ' if value/data type is a String or char
                    if(v["value"]) java += " = " + v["value"];

                    //add semicolon
                    if(idx === arr.length - 1) java += ";\n\n";
                    else java += ";\n";
                }));

                //set operations [visibility] [modifier] dataType[<generic>][array] name ([parameter]) [{] [body] [}]
                dojo.forEach(body["method"], dojo.hitch(this, function(m, idx, arr) {
                    var isAbstract = false;
                    //TODO add JavaDoc

                    //add tabulator
                    java += this.TAB;

                    if(m["visibility"]) java += m["visibility"] + " ";

                    dojo.forEach(m["modifier"], dojo.hitch(this, function(m) {
                        if(m == "abstract") isAbstract = true;
                        java += m + " ";
                    }));

                    java += m["dataType"];
                    if(m["generic"]) java += "<" + m["generic"] + ">";
                    if(m["array"]) java += "[]";
                    java += " ";

                    java += m["name"];

                    java += "(";

                    //add parameter [modifier] dataType[<generic>][array] name
                    dojo.forEach(m["parameter"], dojo.hitch(this, function(param) {
                        dojo.forEach(param["modifier"], dojo.hitch(this, function(m) {
                            java += m + " ";
                        }));

                        java += param["dataType"];
                        if(param["generic"]) java += "<" + param["generic"] + ">";
                        if(param["array"]) java += "[]";
                        java += " ";

                        java += param["name"];

                        //add separator
                        if(idx !== arr.length - 1) java += ", ";
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
            files.push(java);
        }));

        return files;
    }

});

