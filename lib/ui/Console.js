/**
 * User: Christoph Grundmann
 * Date: 10.06.11
 * Time: 13:41
 *
 */
dojo.provide("ui.Console");
dojo.require("ui.Object");

dojo.declare("ui.Console", ui.Object, {
    isSupported: null,
    startupInfo: null,
    nativeProcess: null,

    constructor: function(args) {
        //if native process is supported init it
        if(air.NativeProcess.isSupported) {
            this.isSupported = true;

            this.execute("C:/AdobeAir/bin/adl.exe");
        } else {
            this.isSupported = false;
        }
    },

    /**
     * creates and places the console
     */
    create: function() {

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
        this.startupInfo.executable = new air.File(path);

        //set new event listener. read process output and show it
        this.nativeProcess.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA,
            dojo.hitch(this, function(event) {
                //read process output
                air.Introspector.Console.log(this.output());
            })
        );

        //this.nativeProcess.addEventListener(air.ProgressEvent.STANDARD_INPUT_PROGRESS, this.onInputData);

        //execute native program
        this.nativeProcess.start(this.startupInfo);

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
     */
    addMessage: function(msg) {
        
    }
});
