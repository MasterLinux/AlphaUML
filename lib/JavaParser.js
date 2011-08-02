/**
 * User: Christoph Grundmann
 * Date: 22.07.11
 * Time: 17:45
 *
 * a parser for java
 */
dojo.provide("lib.JavaParser");

dojo.declare("lib.JavaParser", null, {
    errorIndex: null,
    diagram: null,
    parser: null,

    /**
     * initialize parser
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.diagram = args.diagram;
    },

    /**
     * parses a list of java source files
     * @param sources array of file paths
     */
    parse: function(sources, onSuccess, result, index, last) {
        last = last || sources.length - 1;
        result = result || [];
        index = index || 0;

        //get grammar path
        var grammarPath = "java.pegjs";
        if(air) {
            //cause of security violation, air needs other type of path
            var file = air.File.applicationDirectory;
            file = file.resolvePath("java.pegjs");
            grammarPath = file.url;
        }

        //get java file and parse it
        if(sources && sources[index]) {
            var javaPath = sources[index];
            dojo.xhrGet({
                url: grammarPath,
                handleAs: "text",
                load: dojo.hitch(this, function(grammar) {
                    //get source code
                    dojo.xhrGet({
                        url: javaPath,
                        handleAs: "text",
                        load: dojo.hitch(this, function(java) {
                            //create parser if doesn't declared
                            if(!this.parser && !air) this.parser = PEG.buildParser(grammar);
                            else if(!this.parser) this.parser = jParser;

                            air.trace(jParser);
                            air.trace(this.parser);

                            //parse source
                            try {
                                var p = this.parser.parse(java);
                                result.push(p);
                            } catch(error) {
                                //count errors
                                if(!this.errorIndex) this.errorIndex = 0;
                                ++this.errorIndex;

                                //get master console
                                var _console = null;
                                if(this.diagram) {
                                    _console = this.diagram.getGlobal("console", null, "master");
                                }

                                if(_console) {
                                    _console.addMessage("parsing error #" + this.errorIndex + ": " + error.name, true, "error");
                                    _console.addMessage("<span class='tag'>message: </span>" + error.message);
                                    _console.addMessage("<span class='tag'>in line: </span>" + error.line);
                                    _console.addMessage("<span class='tag'>at position: </span>" + error.column);
                                    _console.addMessage("<span class='tag'>in file: </span>" + javaPath);
                                    _console.addMessage("&nbsp;");
                                }
                            }

                            //TODO catch parser error

                            //parse next file
                            if(index < last) {
                                this.parse(sources, onSuccess, result, ++index, last);
                            } else {
                                this.errorIndex = null;
                                if(onSuccess) onSuccess(result);
                            }
                        }),
                        error: dojo.hitch(this, function(error) {
                            if(air) air.trace("java: " + error);
                            else console.debug("java: " + error);
                            //TODO catch error and get next file

                            //parse next file
                            if(index < last) {
                                this.parse(sources, onSuccess, result, ++index, last);
                            } else {
                                this.errorIndex = null;
                                if(onSuccess) onSuccess(result);
                            }
                        })
                    });
                }),
                error: dojo.hitch(this, function(error) {
                    if(air) air.trace("grammar: " + error);
                    else console.debug("grammar: " + error);

                    //parse next file
                    if(index < last) {
                        this.parse(sources, onSuccess, result, ++index, last);
                    } else {
                        this.errorIndex = null;
                        if(onSuccess) onSuccess(result);
                    }
                })
            });
        }

        //return parsed classes
        return result;
    }
});