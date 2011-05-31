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
    sizeUtil: null,
    window: null,
    stage: null,
    headerId: null,
    bodyId: null,
    bodyLeftId: null,
    bodyRightId: null,

    //frames
    workspaceFrame: null,
    fileTreeFrame: null,
    editorFrame: null,
    menuFrame: null,

    /**
     * initializes window
     * @param args
     */
    constructor: function(args) {
        this.sizeUtil = new ui.util.Size();

        //get air specific window properties
        this.window = window.nativeWindow;
        this.stage = this.window.stage;
        
        this.placeAt = "main";
    },

    /**
     * creates window with each
     * necessary frame
     */
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

        //set editor frame
        this.createEditorFrame();

        //resize window on stage resize
        this.window.addEventListener(air.Event.RESIZE, dojo.hitch(this, function() {
            this.setSize(this.stage.stageWidth, this.stage.stageHeight);
        }));

        //resize frames
        this.subscribe({
            event: "FileTreeResize",
            method: function(width) {
                this.setFileTreeSize(width);
            }
        });

        this.subscribe({
            event: "EditorResize",
            method: function(height) {
                this.setEditorSize(height);
            }
        });
    },

    /**
     * sets the size of each registered frame
     * @param width
     * @param height
     */
    setSize: function(width, height) {
        var windowNode = dojo.byId(this.htmlId);
        var headerNode = dojo.byId(this.headerId);
        var bodyNode = dojo.byId(this.bodyId);
        var bodyLeftNode = dojo.byId(this.bodyLeftId);
        var bodyRightNode = dojo.byId(this.bodyRightId);
        var bodyTopNode = dojo.byId(this.bodyTopId);
        var bodyBottomNode = dojo.byId(this.bodyBottomId);

        //set window size
        this.sizeUtil.setSize(windowNode, width, height);

        //set header size
        this.sizeUtil.setSize(headerNode, width);

        //set body size
        var bodyHeight = height - this.sizeUtil.height(this.headerId);
        this.sizeUtil.setSize(bodyNode, width, bodyHeight);

        //set body left size
        var bodyLeftWidth = this.sizeUtil.width(this.bodyLeftId);
        this.sizeUtil.setSize(bodyLeftNode, null, bodyHeight);

        //set body right size
        var bodyRightWidth = width - bodyLeftWidth;
        this.sizeUtil.setSize(bodyRightNode, bodyRightWidth, bodyHeight);

        //set body top size
        var bodyBottomHeight = this.sizeUtil.height(this.bodyBottomId);
        this.sizeUtil.setSize(bodyBottomNode, bodyRightWidth, bodyBottomHeight);

        //set body top size
        var bodyTopHeight = bodyHeight - bodyBottomHeight;
        this.sizeUtil.setSize(bodyTopNode, bodyRightWidth, bodyTopHeight);

        //TODO set frame size
        this.editorFrame.setSize(bodyRightWidth, bodyBottomHeight);
    },

    /**
     * sets the height of the editor frame
     * @param height
     */
    setEditorSize: function(height) {
        //set body top size
        this.sizeUtil.setSize(this.bodyBottomId, null, height);

        //set body top size
        var bodyTopHeight = dojo.position(dojo.byId(this.bodyId)).h - height;
        this.sizeUtil.setSize(this.bodyTopId, null, bodyTopHeight);
    },

    /**
     * sets the width of the file tree frame
     * @param width
     */
    setFileTreeSize: function(width) {
        //set body left size
        this.sizeUtil.setSize(this.bodyLeftId, width);

        //set body right size
        var bodyRightWidth = dojo.position(dojo.byId(this.bodyId)).w - width;
        this.sizeUtil.setSize(this.bodyRightId, bodyRightWidth);

        //set body top size
        this.sizeUtil.setSize(this.bodyBottomId, bodyRightWidth);

        //set body top size
        this.sizeUtil.setSize(this.bodyTopId, bodyRightWidth);
    },

    createEditorFrame: function() {
        var tabs = {
            tab1: new ui.Tab({
                title: "tab5",
                onClick: function() {
                    //console.debug("tab1 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab5</div>'
                })
            }),
            tab2: new ui.Tab({
                title: "tab6",
                onClick: function() {
                    //console.debug("tab2 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab6</div>'
                })
            }),
            tab4: new ui.Tab({
                title: "ClassDiagram- 7",
                onClick: function() {
                    //console.debug("tab4 clicked!");
                },
                content: new ui.Content({
                    content: '<div>ClassDiagram- 7</div>'
                })
            }),
            auto: new ui.Tab({
                title: "ClassDiagram8",
                onClick: function() {
                    //console.debug("tab auto clicked!");
                },
                content: new ui.Content({
                    content: '<div>ClassDiagram8</div>'
                })
            })
        }

        this.editorFrame = new ui.Frame({
            placeAt: this.bodyBottomId,
            title: "Editor",
            tabs: tabs
        });

        this.editorFrame.create();
    }
});

