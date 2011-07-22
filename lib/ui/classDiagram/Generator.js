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
        //parse java files
        var javaFiles = this.parser.parse(filePaths);

        //iterate files
        dojo.forEach(javaFiles, dojo.hitch(this, function(file) {
            //iterate classes of the current file
            dojo.forEach(file["classes"], dojo.hitch(this, function(c) {
                //TODO get @uml tag and use position and diagram name of it if exists
                var _class = new ui.classDiagram.Class({
                    placeAt: this.diagram.areaId,
                    _imports: file["imports"],
                    _package: file["package"],
                    name: c["name"],
                    x: 0,
                    y: 0
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

                //TODO remove
                _class.create();

                //TODO set extend and implement connectors
            }));
        }));
    }
});
