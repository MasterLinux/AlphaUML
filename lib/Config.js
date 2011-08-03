/**
 * User: Christoph Grundmann
 * Date: 27.07.11
 * Time: 19:17
 *
 */
dojo.provide("lib.Config");

dojo.declare("lib.Config", null, {
    //program paths
    javac: null,
    javaDoc: null,

    //JavaDoc info
    ignore: null,
    main: null,
    root: null,

    constructor: function(args) {
        args = args || {};
        this.ignore = args.ignore;
        this.main = args.main;
        this.root = args.root;
        this.javac = args.javac;
        this.javaDoc = args.javaDoc;

        //this.javac = "C:\\Programme\\Java\\jdk1.6.0_25\\bin\\";
    }
});