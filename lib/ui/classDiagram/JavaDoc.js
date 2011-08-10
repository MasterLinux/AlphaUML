/**
 * User: Christoph Grundmann
 * Date: 09.08.11
 * Time: 21:14
 * JavaDoc storage
 */
dojo.provide("ui.classDiagram.JavaDoc");

dojo.declare("ui.classDiagram.JavaDoc", null, {
    description: null,
    atParam: null,
    atReturn: null,
    atThrows: null,
    atException: null,
    atSince: null,
    atAuthor: null,
    atSee: null,

    /**
     * if each value is null it returns true
     * otherwise false
     */
    isNull: function() {
        if(
            !this.description &&
            !this.atParam &&
            !this.atReturn &&
            !this.atThrows &&
            !this.atException &&
            !this.atSince &&
            !this.atAuthor &&
            !this.atSee
        ) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * get each line of the description
     * as an array
     */
    getDescription: function() {
        if(this.description) {
            return this.description.replace(/^(\s+)/, "").replace(/(\s+)$/, "").split("\n");
        } else {
            return [];
        }
    }
});
