/**
 * User: Christoph Grundmann
 * Date: 27.04.11
 * Time: 21:33
 *
 * Class for handling the push notification service
 *
 */

dojo.provide('lib.Push');

dojo.declare('lib.Push', null, {
    socket: null,

    constructor: function() {
        //create script tag for including socket.io
        /*dojo.place(
            '<script type="text/javascript" src="http://dev.apetheory.net:7000/socket.io/socket.io.js"></script> ',
            dojo.byId('head'), "first"
        );*/

        //create a new socket
        this.socket = new io.Socket(
            'dev.apetheory.net',
            { port: 7000 }
        );
    },

    /**
     * connects with the notification server
     */
    connect: function() {
        this.socket.connect();
    },
    /*
     sd
     */

    register: function(docId) {

    }

});