 
var app = {
    userid: "",
    MACAddress: "",
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
       window.MacAddress.getMacAddress(
           function(macAddress) {
               app.MACAddress = macAddress;
           },
           function(fail) {
               app.MACAddress = "0.0.0.0";
           }    
       );
       //alert(app.MACAddress);
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
                if ( e.regid.length > 0 ) {
                    console.log("Regid " + e.regid);
                    var _token = e.regid;
                    //alert('registration id = '+_token);
                    _regparams ={};
                    _regparams.proto = "gcm";
                    _regparams.token = _token;
                    $.post("http://push.metrofi.co.za/subscribers",_regparams,function(_regdata){
                         var _userid = _regdata.id;
                         app.userid = _userid;
                         _subsurl = "http://push.metrofi.co.za/subscriber/"+_userid+"/subscriptions/METROFI_MESSAGE_"+_userid;
                         //alert(_userid+" registered with token "+_token);
                         $.post(_subsurl,function(_regdata){
                              var _params = {};
                              _params.deviceid = _token;
                              _params.userid = _userid;
                              _params.macaddress = app.MACAddress;
                              $.getJSON("http://metrofi.co.za/client/register.php",_params,function(_data){
                                  var _welcomeurl = "http://push.metrofi.co.za/event/METROFI_MESSAGE_"+app.userid;
                                  //alert(_welcomeurl);
                                  var _welcomeparams = {};
                                  _welcomeparams.msg = "Welcome to MetroFi FREE WiFi";
                                  $.post(_welcomeurl, _welcomeparams, function(_welcome){
                                      $("#message_header").hide();
                                       navigator.notification.vibrate(1000);
                                       window.plugins.toast.showLongBottom(
                                          'Connected to MetroFi FREE WiFi', 
                                          function(a){
                                              console.log('toast success: ' + a)
                                          }, 
                                          function(b){
                                              alert('toast error: ' + b)
                                          }    
                                      );
                                  });
                              });                            
                         }); 
                    }); 
                }
                break;

            case 'message':
                //alert("message received "+e.payload+e.message);
                window.plugins.toast.showLongBottom(
                     'Message received from MetroFi: '+e.message, 
                     function(a){
                         console.log('toast success: ' + a)
                     }, 
                     function(b){
                          alert('toast error: ' + b)
                     });
                navigator.notification.vibrate(1000);
                $("#message_list").append("<li>:: "+e.message+"</li>");
                $('#message_list').listview('refresh');
                var _win = window.open("http://metrofi.co.za?userid="+app.userid,"_blank","location=yes");
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
