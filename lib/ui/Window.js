/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 00:25
 *
 */
dojo.provide("ui.Window");
dojo.require("ui.Object");
dojo.require("ui.util.Size");
dojo.require("ui.Frame");
dojo.require("ui.Tab");

dojo.declare("ui.Window", ui.Object, {
    window: null,
    stage: null,
    headerId: null,
    bodyId: null,
    bodyLeftId: null,
    bodyRightId: null,

    //frames
    fileBrowser: null,
    

    constructor: function(args) {
        //get air specific window properties
        this.window = window.nativeWindow;
        this.stage = this.window.stage;
        
        this.placeAt = "main";
    },

    create: function() {
        this.inherited(arguments);

        //set each necessary id
        this.headerId = this.htmlId + "Header";
        this.bodyId = this.htmlId + "Body";
        this.bodyLeftId = this.htmlId + "BodyLeft";
        this.bodyRightId = this.htmlId + "BodyRight";
        this.bodyTopId = this.htmlId + "BodyTop";
        this.bodyBottomId = this.htmlId + "BodyBottom";

        dojo.place(
            '<div class="Window" id="' + this.htmlId + '">' +
                '<div class="header" id="' + this.headerId + '"></div>' +
                '<div class="body" id="' + this.bodyId + '">' +
                    '<div class="left" id="' + this.bodyLeftId + '"></div>' +
                    '<div class="right" id="' + this.bodyRightId + '">' +
                        '<div class="top" id="' + this.bodyTopId + '"></div>' +
                        '<div class="bottom" id="' + this.bodyBottomId + '"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //resize window on stage resize
        this.window.addEventListener(air.Event.RESIZE, dojo.hitch(this, function() {
            this.setSize(this.stage.stageWidth, this.stage.stageHeight);
        }));
    },

    setSize: function(width, height) {
        var sizeUtil = new ui.util.Size();
        var windowNode = dojo.byId(this.htmlId);
        var headerNode = dojo.byId(this.headerId);
        var bodyNode = dojo.byId(this.bodyId);
        var bodyLeftNode = dojo.byId(this.bodyLeftId);
        var bodyRightNode = dojo.byId(this.bodyRightId);

        //set window size
        dojo.style(windowNode, "width", width + "px");
        dojo.style(windowNode, "height", height + "px");

        //set header size
        dojo.style(headerNode, "width", width + "px");

        //set body size
        var bodyHeight = height - sizeUtil.height(this.headerId);
        dojo.style(bodyNode, "width", width + "px");
        dojo.style(bodyNode, "height", bodyHeight + "px");

        //set body left size
        var bodyLeftWidth = sizeUtil.width(this.bodyLeftId);
        dojo.style(bodyLeftNode, "height", bodyHeight + "px");

        //set body right size
        var bodyRightWidth = width - bodyLeftWidth;
        dojo.style(bodyRightNode, "width", bodyRightWidth + "px");
        dojo.style(bodyRightNode, "height", bodyHeight + "px");
    }


});

