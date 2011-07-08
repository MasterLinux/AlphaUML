/**
 * User: Christoph Grundmann
 * Date: 07.07.11
 * Time: 11:20
 *
 * generates java code from a list of
 * classes and connectors
 */
dojo.provide("lib.JavaGenerator");

dojo.declare("lib.JavaGenerator", null, {
    connectors: null,
    classes: null,

    //special characters
    TAB: "     ",

    /**
     * initializes generator
     * args: {
     *   connectors: array of ui.classDiagram.Connector,
     *   classes: array of ui.classDiagram.Class
     * }
     * @param args object
     */
    constructor: function(args) {
        this.connectors = args.connectors;
        this.classes = args.classes;
    },

    /**
     * @return {
     *  "className" : {
     *      class: ui.classDiagram.Class,
     *      extend: [
     *          {
     *              superclass: "superClassName",
     *              overwritten: ["operationName"]
     *          }
     *      ]
     *  }
     */
    analyzer: function() {
        var structure = {};

        //generate relation logic
        dojo.forEach(this.connectors, dojo.hitch(this, function(con) {
            var generalization = [];
            var association = [];

            //get super and subclass
            var super = con.p0Class;
            var sub = con.p3Class;

            //TODO check for duplicates
            //store classes if necessary
            if(!structure[super.name]) {
                structure[super.name] = {
                    "class": super,
                    "extend": []
                }
            }

            if(!structure[sub.name]) {
                structure[sub.name] = {
                    "class": sub,
                    "extend": []
                }
            }

            //set generalization
            if(con.type == "Generalization") {
                var overwritten = this.compareOperations(super, sub);
                structure[sub.name].extend.push({
                    superclass: super.name,
                    overwritten: overwritten
                });
            }

            //TODO check for other connector types like associations
        }));

        return structure;
    },

    compareOperations: function(super, sub) {
        var overwritten = [];
        var superOps = super.getOperations();
        var subOps = sub.getOperations();

        for(var opName in superOps) {
            //operation with the same name found
            if(subOps[opName]) {
                //compare params and return type
                if(subOps[opName].returnType == superOps[opName].returnType) {
                    var superParams = superOps[opName].parameter;
                    var subParams = subOps[opName].parameter;
                    var superParamCount = 0;
                    var subParamCount = 0;

                    //count number of params
                    for(var i in superParams) ++superParamCount;
                    for(var i in subParams) ++subParamCount;

                    //methods have to be identical
                    if(superParamCount == subParamCount) {
                        //TODO test for errors if a param isn't identical
                        //store overwritten operation
                        overwritten.push(opName);
                    }
                }
            }
        }

        return overwritten;
    },

    /**
     * generates the source code
     *
     * @param structure
     */
    generator: function(structure) {
        var javaFile = [];
        
        for(var name in structure) {
            var c = structure[name];

            //create new class
            var code = [];

            code.push("public class ");
            code.push(name + " ");

            //class inherits
            if(c.extend.length > 0) {
                code.push("extends " + c.extend[0].superclass + " ");
            }

            code.push("{\n");

            //TODO add attributes

            //get operations
            // operations: {
            //  "operationName": {
            //      name: string,
            //      returnType: string,
            //      visibility: string,
            //      property: string,
            //      parameter: object
            //   }
            // }
            var operations = c["class"].getOperations();
            //add operations
            for(var opName in operations) {
                //get operation
                var op = operations[opName];

                code.push("\n" + this.TAB);
                if(op.visibility) code.push(op.visibility + " ");
                if(op.returnType) code.push(op.returnType + " ");
                else code.push("void ");
                code.push(op.name + "(");

                //get parameter
                // parameter: {
                //   "parameterName": {
                //      name: string,
                //      dataType: string,
                //      property: string,
                //      multiplicity: string,
                //      defaultValue: string
                //   }
                // }
                var parameter = op.parameter;
                
                //add parameter
                var parameterCounter = 0;
                for(var paramName in parameter) {
                    ++parameterCounter;

                    //set comma
                    if(parameterCounter >= 2) {
                        code.push(", ");
                    }
                    
                    //get parameter
                    var param = parameter[paramName];
                    code.push(param.dataType + " ");
                    code.push(param.name);
                }

                //operation body
                code.push(") {\n");

                //TODO add super.operation name
                dojo.forEach(c.extend[0].overwritten,
                    dojo.hitch(this, function(name) {
                        //add super method
                        if(opName == name) {
                            code.push(this.TAB + this.TAB);
                            code.push("super." + name + "(");

                            //add parameter
                            var parameterCounter = 0;
                            var parameter = op.parameter;
                            for(var paramName in parameter) {
                                ++parameterCounter;

                                //set comma
                                if(parameterCounter >= 2) {
                                    code.push(", ");
                                }

                                //get parameter
                                var param = parameter[paramName];
                                code.push(param.name);
                            }
                            
                            code.push(");\n");
                        }
                    })
                );

                //operation end
                code.push(this.TAB + "}\n");
            }

            code.push("}");

            //create java file
            javaFile.push(code.join(""));
        }

        console.debug(javaFile);
    }
});

