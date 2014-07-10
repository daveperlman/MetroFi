 
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        var pushNotification = window.plugins.pushNotification;
        pushNotification.register(app.successHandler, app.errorHandler,   {"senderID":"338635639573","ecb":"app.onNotificationGCM"});
       //app.startTimer();
       //alert("timer started");
       //$("#message_container").html("START LISTING MESSAGES");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    // result contains any message sent from the plugin call
    successHandler: function(result) {
        //alert('Callback Success! Result = '+result)
    },
    errorHandler:function(error) {
        alert(error);
    },
    onNotificationGCM: function(e) {
        //alert("notified");
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    console.log("Regid " + e.regid);
                    var _token = e.regid;
                    alert('registration id = '+_token);
                    _regparams ={};
                    _regparams.proto = "GCM";
                    _regparams.token = _token;
                    $.post("http://push.metrofi.co.za/client/register.php",_regparams,function(_regdata){
                         //var _userid = _regdata.id;
                         //_subsurl = "http://push.metrofi.co.za/subscriber/"+_userid+"/subscriptions/METROFI_MESSAGE_"+_userid;
                         alert("registered");
                         //$.post(_subsurl,function(_regdata){
                         //     var _params = {};
                         //     _params.deviceid = _token;
                         //     _params.userid = _userid;
                              //$.getJSON("http://metrofi.co.za/client/register.php",_params,function(_data){
                                  $("message_container").html("<h3>Registerd on MetroFi server</h3>");
                              //});                            
                         //}); 
                    }); 
            }
                break;

            case 'message':
                alert("message received "+e.msg);
                // this is the actual push notification. its format depends on the data model from the push server
                //$("#message_container").append(e.msg);
                //window.navigator.notification.alert(
                //    'Test Alert on Device Ready!', 
                //    alertDismissed,  
                //   'Testing',  
                //   'Ok'          
                //);
                break;

            case 'error':
                alert('GCM error = '+e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    }
    
   };
