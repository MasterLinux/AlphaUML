/**
 * User: Christoph Grundmann
 * Date: 22.07.11
 * Time: 17:45
 *
 * a parser for java
 */
dojo.provide("lib.JavaParser");

dojo.declare("lib.JavaParser", null, {
    parser: null,

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
                            else this.parser = jParser;

                            //parse source
                            var p = this.parser.parse(java);
                            result.push(p);

                            //TODO catch parser error

                            //parse next file
                            if(index < last) {
                                this.parse(sources, onSuccess, result, ++index, last);
                            } else {
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
                        if(onSuccess) onSuccess(result);
                    }
                })
            });
        }

        //return parsed classes
        return result;
    }
});