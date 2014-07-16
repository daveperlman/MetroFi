 
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
  
        //GET MAC ADDRESS
        window.MacAddress.getMacAddress(
            function(macAddress) {
                app.MACAddress = macAddress;
            },
            function(fail) {
                app.MACAddress = "0.0.0.0";
            }    
        );
        
        document.addEventListener("backbutton", app.onBackKeyDown, false);
        document.addEventListener("menubutton", app.onBackKeyDown, false);
        document.addEventListener("searchbutton", app.onBackKeyDown, false);

  
        //HANDLE BACKGROUND NOTIFICATIONS
        //var BGN = window.plugins.backgroundNotification;
        //var notificationCallback = function(notification) {
        //    console.log('BackgroundNotification received');
        //    _params = {};
        //    _params.message = "RECEIVED_AT_DEVICE"; 
        //    $.get("http://metrofi.co.za/client/notify.php", _params, function(_response) {
        //            //                    
        //            BGN.finish();
        //    });
        //}
        //BGN.configure(notificationCallback);  

        //alert(app.MACAddress);
  
    },
    onBackKeyDown: function() {
        navigator.Backbutton.goHome();
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
        //alert(e.event);
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
                         $("#header_message").text("Registering ....");
                         var _userid = _regdata.id;
                         app.userid = _userid;
                         _subsurl = "http://push.metrofi.co.za/subscriber/"+_userid+"/subscriptions/METROFI_MESSAGE_"+_userid;
                         //alert(_userid+" registered with token "+_token);
                         $.post(_subsurl,function(_regdata){
                              $("#header_message").append("...");
                              var _params = {};
                              _params.deviceid = _token;
                              _params.userid = _userid;
                              _params.macaddress = app.MACAddress;
                              $.getJSON("http://metrofi.co.za/client/register.php",_params,function(_data){
                                  $("#header_message").text("Registering .....");
                                  var _welcomeurl = "http://push.metrofi.co.za/event/METROFI_MESSAGE_"+app.userid;
                                  //alert(_welcomeurl);
                                  var _welcomemessage = "Welcome to MetroFi FREE WiFi - Yours to use completely free of charge as long as you support our sponsors by clicking on their messages. - Just click GO FREE to continue free internet access via our MetroFi node.<br><br>If you prefer a faster connection with NO SPONSOR NAGGING click GO PREMIUM instead and get a high speed PREMIUM MetroFi connection for just R9.99!";
                                  var _welcomeparams = {};
                                  _welcomeparams.msg = _welcomemessage;
                                  _welcomeparams.title = "Registered on MetroFi";
                                  $.post(_welcomeurl, _welcomeparams, function(_welcome){
                                      $("#header_message").text("Registering ......");
                                      navigator.notification.vibrate(500);
                                      //window.plugins.toast.showLongBottom(
                                      //    'Registered on MetroFi FREE WiFi', 
                                      //    function(a){
                                      //        console.log('toast success: ' + a)
                                      //    }, 
                                      //    function(b){
                                      //        alert('toast error: ' + b)
                                      //    }   
                                      //);
                                      _pingparams = {};
                                      _pingparams.status = "SESSION_STARTED"; 
                                      _pingparams.title = 'Registered on MetroFi';
                                      _pingparams.message = _welcomemessage;
                                      _pingparams.userid = app.userid;
                                      _pingparams.macaddress = app.MACAddress;
                                      $.get("http://metrofi.co.za/client/notify.php", _pingparams, function(_response) {
                                          $("#message_header").hide();
                                          $("#div_buttons").show();
                                      });
                                  });
                              });                            
                         }); 
                    }); 
                }
                break;

            case 'message':
                //alert("message received "+e.payload+e.message);
                if (e.foreground) {
                     app.handleNotification(e);
                } else {
                    if (e.coldstart) {
                        setTimeout(app.handleNotification(e),20000);                
                    } else {
                        setTimeout(app.handleNotification(e),20000);                
                    }
                }                 
                break;

            case 'error':
                alert('GCM error = '+e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    },
    handleNotification: function(e) {

        //UPDATE PAGE
        var _advertid = e.payload.title.replace(/ /,"");
        _advert = {};
        _advert.image = "http://metrofi.co.za/client/images/182.jpg";
        _li = "<li class='mf-link-"+_advertid+"'>";
        _li += "<h3>:: "+e.payload.title+"</h3>";
        _li += "<div style='font-weight:normal;'>"+e.message+"</div>";
        _li += "<div class='msg-content'></div>";
        _li += "<span style='float:right;font-size:small;font-style;italic;font-weight:light;'>Tap to visit sponsor&nbsp;</span><br>";
        _li += "</li>";
        var _messageblock = $(_li);
        //$("#message_list").prepend(_messageblock);
        var _url = "http://metrofi.co.za?adverttitle="+e.payload.title+"&userid="+app.userid;
        _advertparams={};
        _advertparams.advert = e.payload.title;
        _advertparams.title = e.payload.title;
        _advertparams.message = e.payload.message;
        _advertparams.userid = app.userid;
        _advertparams.macaddress = app.MACAddress;
        $.get("http://metrofi.co.za/client/getadvert.php?",_advertparams,function(_advert){
           //alert(_advert[0].type+_advert[0].content);
             if (_advert[0].type == "image") {
             alert(_advert[0].content);
             //    _messageblock.find(".msg-content").append("<img src='"+_advert[0].content+"' style='width:100%;'");            
             }
             if (_advert[0].url) {
                 _url = _advert[0].url;
             }    
        }).always(function(){
            _messageblock.on("click", function(){
                window.open(_url,'_system','location=no');
            });
            $('#message_list').prepend(_messageblock).listview('refresh');
        });

        //PING BACK TO SERVER
        _params = {};
        _params.status = "READ_BY_USER"; 
        _params.message = e.message;
        _params.title = e.payload.title;
        _params.userid = app.userid;
        _params.macaddress = app.MACAddress;
        $.get("http://metrofi.co.za/client/notify.php", _params, function(_response) {
            $("#div_buttons").show();
        });
              
        //SHOW TOAST OR VIBRATE
        if (e.foreground) { 
            navigator.notification.beep(1);
        } else {
            //window.plugins.toast.showLongCenter(
            //     'Message received from MetroFi: '+e.payload.title+"<br>"+e.message, 
            //     function(a){
            //         console.log('toast success: ' + a)
            //     }, 
            //     function(b){
            //          alert('toast error: ' + b)
            //     }
            //);
        }

        //GET ADVERT      
        //var _win = window.open("http://metrofi.co.za?userid="+app.userid,"_system","location=no");

    }
    
   };
