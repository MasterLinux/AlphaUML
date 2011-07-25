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

        //get java file and parse it
        if(sources && sources[index]) {
            dojo.xhrGet({
                url: "java.pegjs",
                handleAs: "text",
                load: dojo.hitch(this, function(grammar) {
                    //get source code
                    dojo.xhrGet({
                        url: sources[index],
                        handleAs: "text",
                        load: dojo.hitch(this, function(java) {
                            //create parser if doesn't declared
                            if(!this.parser) this.parser = PEG.buildParser(grammar);

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
                            //TODO catch error and get next file
                            console.debug("java: " + error);

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
                    console.debug("grammar: " + error);

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