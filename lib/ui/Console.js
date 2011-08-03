/**
 * User: Christoph Grundmann
 * Date: 10.06.11
 * Time: 13:41
 *
 */
dojo.provide("ui.Console");
dojo.require("ui.Object");
dojo.require("ui.Language");

dojo.declare("ui.Console", ui.Object, {
    language: null,
    isSupported: null,
    startupInfo: null,
    nativeProcess: null,
    messages: null,

    /**
     * initialize console
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.language = new ui.Language();
        this.isSupported = (!air || !air.NativeProcess) ? false : air.NativeProcess.isSupported;
        this.uiType = "console";
        this.id = args.id;
    },

    /**
     * creates and places the console
     */
    create: function() {
        this.inherited(arguments);

        this.setGlobal(this.uiType);

        //place console
        this.createConsole();

        if(this.isSupported) {
            this.execute("C:/AdobeAir/bin/adl.exe");
        }
    },

    /**
     * executes a specific command
     * @param cmd string "javac" or "javadoc"
     */
    executeCmd: function(cmd) {
        this.addMessage(cmd);
    },

    /**
     * TODO rename to execute
     * loads and executes a program
     * @param path path to the executable
     */
    execute: function(path) {
        //TODO Capabilities.os.toLowerCase().indexOf("win"); "mac"
        //TODO check whether the file exists
        //destroy current active process
        if(this.nativeProcess) {
            this.nativeProcess.closeInput();
            this.nativeProcess.exit(true);
            this.nativeProcess = null;
        }

        //create new native process
        this.nativeProcess = new air.NativeProcess();

        //destroy old startup info if already exists
        if(this.startupInfo) this.startupInfo = null;
        
        //get startup info of the executable
        this.startupInfo = new air.NativeProcessStartupInfo();
        var file = new air.File(path);

        //if program exists set event handler and execute
        if(file.exists) {
            this.startupInfo.executable = file;

            //set new event listener. read process output and show it
            this.nativeProcess.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA,
                dojo.hitch(this, function(event) {
                    //get process output
                    var out = this.output();

                    //write process output to the console
                    dojo.forEach(out, dojo.hitch(this, function(msg) {
                        this.addMessage(msg);
                    }));
                })
            );

            //execute native program
            this.nativeProcess.start(this.startupInfo);
        } else {
            //show error message
            this.addMessage(this.language.FILE_NOT_FOUND);
        }

        //TODO check whether correct
        if(this.nativeProcess.running) {
            this.nativeProcess.closeInput();
        }
    },

    /**
     * reads console output
     * and returns it
     * @return array of strings
     */
    output: function() {
        var bytes = new air.ByteArray();

        //get the standard output of the native process
        var output = this.nativeProcess.standardOutput;

        //read bytes of the output
        output.readBytes(bytes, 0, output.bytesAvailable)

        //returns array with each line of output
        return bytes.toString().split("\n");
    },

    /**
     * adds a message into DOM
     * @param msg string
     * @param store boolean
     * @param type string "error", "warning" or "success"
     */
    addMessage: function(msg, store, type) {
        store = (typeof store == "boolean") ? store : true;
        
        //store message
        if(!this.messages) this.messages = [];
        if(store) this.messages.push(msg);

        //add message into dom
        var node = dojo.byId(this.htmlId);
        if(node) {
            var _type = "";
            //set error color
            if(type == "error") _type = " error";
            else if(type == "warning") _type = " warning";
            else if(type == "success") _type = " success";

            //place message
            dojo.place(
                '<div class="message' + _type + '">' + msg + '</div>',
                node
            );

            //set scroll position to the bottom
            node.scrollTop = node.scrollHeight;
        }
    },

    /**
     * sets the size of console
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        var consoleNode = dojo.byId(this.htmlId);
        if(consoleNode) {
            dojo.style(consoleNode, "width", width + "px");
            dojo.style(consoleNode, "height", height + "px");
        }
    },

    /**
     * places the console into dom
     */
    createConsole: function() {
        //place menu
        dojo.place(
            '<div class="Console" uitype="' + this.uiType + '" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );
    },

    /**
     * activates each event handler of the console
     * and recreate the dom
     */
    activate: function() {
        this.inherited(arguments);

        //destroy node if already exists
        var node = dojo.byId(this.htmlId);
        if(!node) {
            //create a new console
            this.createConsole();

            //add messages
            dojo.forEach(this.messages, dojo.hitch(this, function(msg) {
                this.addMessage(msg, false);
            }));
        }
    },

    /**
     * deactivates each event handler
     * and removes console from dom
     */
    deactivate: function() {
        this.inherited(arguments);

        //destroy node if exists
        var node = dojo.byId(this.htmlId);
        if(node) dojo.destroy(node);
    }
});
