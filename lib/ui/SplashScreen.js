/**
 * User: Christoph Grundmann
 * Date: 28.05.11
 * Time: 20:55
 *
 */
dojo.provide("ui.SplashScreen");

dojo.declare("ui.SplashScreen", ui.Object, {
    window: null,
    stage: null,
    isOpen: null,
    
    constructor: function(args) {
        //get air specific window properties
        this.window = window.nativeWindow;
        this.stage = this.window.stage;

        this.isOpen = false;

        //create splash screen
        this.create();
    },

    /**
     * places the splash screen
     */
    create: function() {
        this.inherited(arguments);

        //place splash screen
        dojo.place(
            '<div class="SplashScreen" style="opacity: 0; display: none;" id="' + this.htmlId + '">' +
                '<div class="image"></div>' +
            '</div>',
            dojo.body()
        );
        
        this.setSize(
            this.stage.stageWidth,
            this.stage.stageHeight
        );

        //resize it on stage resize
        this.window.addEventListener(air.Event.RESIZE, dojo.hitch(this, function() {
            this.setSize(this.stage.stageWidth, this.stage.stageHeight);
        }));
    },

    /**
     * sets the size of the splash screen
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        var node = dojo.byId(this.htmlId);

        dojo.style(node, "width", width + "px");
        dojo.style(node, "height", height + "px");
    },

    /**
     * opens the splash screen
     */
    open: function() {
        this.isOpen = true;
        this.show(1);
    },

    /**
     * closes the splash screen
     * @param wait integer wait for closing in seconds
     */
    close: function(wait) {
        wait = wait || 1000;
        this.isOpen = false;

        //hide on timeout
        window.setTimeout(dojo.hitch(this, function(){
            //throw RefreshWindow event
            dojo.publish("RefreshWindow");

            //hide splash screen TODO destroy
            this.hide(300);
        }), wait);
    }
});
