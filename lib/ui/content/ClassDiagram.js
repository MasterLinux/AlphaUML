/**
 * User: Christoph Grundmann
 * Date: 19.06.11
 * Time: 16:05
 *
 * implementation of a class diagram area
 */
dojo.provide("ui.content.ClassDiagram");
dojo.require("ui.content.Scrollable");
//dojo.require("dojo.dnd.Movable");

dojo.declare("ui.content.ClassDiagram", ui.content.Scrollable, {
    classId: null,
    classDnD: null,

    constructor: function(args){},

    create: function() {
        this.inherited(arguments);

        //test class
        this.classId = this.htmlId + "Class";
        dojo.place(
            '<div class="class" style="width: 100px; height: 80px; background: #ededed; cursor: default;" id="' + this.classId + '"></div>',
            dojo.byId(this.areaId)
        );

        this.classDnD = new dojo.dnd.Moveable(this.classId);
    }
});
