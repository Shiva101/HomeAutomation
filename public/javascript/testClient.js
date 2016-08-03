
// Create a client instance: Broker, Port, Websocket Path, Client ID
client = new Paho.MQTT.Client("iot.eclipse.org", Number(80), "/ws", "clientId");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

var publishTopic = {lights:"SJSU_EE297b/smartLight/set" , 
                    window:"SJSU_EE297b/smartWindow/set",
                    uiControl:"SJSU_EE297b/uiControl/get"};
var subscribeTopic = {lights:"SJSU_EE297b/smartLight/get" , 
                      window:"SJSU_EE297b/smartWindow/get" ,
                      tempHumidity:"SJSU_EE297b/humidity/get" ,
                      tempTemperature:"SJSU_EE297b/temperature/get" ,
                      AirQuality:"SJSU_EE297b/smartAirQuality/get" ,
                      uiControl:"SJSU_EE297b/uiControl/get"
                    };


// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe(subscribeTopic.lights);    //for subscription of lights
  client.subscribe(subscribeTopic.window);    //for subscription of windows
  client.subscribe(subscribeTopic.tempHumidity);    //for subscription of tempHumidity
  client.subscribe(subscribeTopic.tempTemperature);
  client.subscribe(subscribeTopic.AirQuality);    //for subscription of AirQuality
  message = new Paho.MQTT.Message("ui_control_joined");
        message.destinationName = publishTopic.uiControl;
        client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

function onBulbClick() {

  document.body.style.backgroundImage = "url('public/images/body-night.jpg')";
    var image = document.getElementById('myImageBulb');
    if (image.src.match("bulbon")) {
        message = new Paho.MQTT.Message("off");
        message.destinationName = publishTopic.lights;
        client.send(message);
    } // end if
    else if (image.src.match("bulboff")) {
        message = new Paho.MQTT.Message("on");
        message.destinationName = publishTopic.lights;
        client.send(message);
    } // end if
};  // end onBulbClick

function onWindowClick() {
    var image = document.getElementById('myImageWindow');
    if (image.src.match("windowOpen")) {
        message = new Paho.MQTT.Message("close");
        message.destinationName = publishTopic.window;
        client.send(message);
    } // end if
    else if (image.src.match("windowClosed")) {
        message = new Paho.MQTT.Message("open");
        message.destinationName = publishTopic.window;
        client.send(message);
    } // end if
};  // end onWindowClick

function onMessageArrived(message) {
  console.log("inside onMessageArrived");
  console.log('Message Recieved: Topic: ', message.destinationName, '. Payload: ', message.payloadString, '. QoS: ', message.qos);
  console.log("topic is : " + message.destinationName);
  
  switch(message.destinationName) { 
    case subscribeTopic.lights:    //start case 1
        {
          console.log ("Backend Received light status: " + message.payloadString);
          var lightStatus = message.payloadString;
          if  (lightStatus.toLowerCase() === "on"){
              var image = document.getElementById('myImageBulb');
              image.src = "public/images/pic_bulbon.gif";
              document.getElementById("lights").innerHTML = "Click to switch off the bulb";
            }
          if  (lightStatus.toLowerCase() === "off"){
              var image = document.getElementById('myImageBulb');
              image.src = "public/images/pic_bulboff.gif";
              document.getElementById("lights").innerHTML = "Click to switch on the bulb";
            }
            
        }   break;// end case:1 deviceIOTLights

    case subscribeTopic.window:   // start case 2
        {
          console.log ("Backend Received Window status: " + message.payloadString);
          var windowStatus = message.payloadString;
          if  (windowStatus.toLowerCase() === "open"){
              var image = document.getElementById('myImageWindow');
              image.src = "public/images/windowOpen.png";
              document.getElementById("window").innerHTML = "Click on window to close";
            }
          if  (windowStatus.toLowerCase() === "close"){
              var image = document.getElementById('myImageWindow');
              image.src = "public/images/windowClosed.png";
              document.getElementById("window").innerHTML = "Click on window to open";
            }
            
        }   break;// end case 2: deviceIOTWindow

    case subscribeTopic.tempHumidity:   // start case 3
        {
          console.log ("Backend Received Humidity status: " + message.payloadString);
          var tempHumidityStatus = message.payloadString;
          humidity = tempHumidityStatus;  // values saved in humidity[0]
          var humidityHeader = "Humidity: " + humidity;
          document.getElementById("humidity").innerHTML= humidityHeader;       
       }   break;// end case 3: deviceIOTTempHumidity

    case subscribeTopic.tempTemperature:   // start case 3
        {
          console.log ("Backend Received Temperature status: " + message.payloadString);
          var tempTemperatureStatus = message.payloadString;
          //var x =  tempHumidityStatus.split("=");
          temp= tempTemperatureStatus;  // values saved in temp[0]
          //humidity = x[2].split("%");  // values saved in humidity[0]

          if  (temp >= 30 ){
              var image = document.getElementById('myTempHumidity');
              image.src = "public/images/hot.jpg";
              document.getElementById("tempHumidity").innerHTML = "Alert : Temperature is HIGH";
              var tempHeader = "Temperature: " + temp;
              document.getElementById("temp").innerHTML= tempHeader;
            }
          if  (temp < 30){
              var image = document.getElementById('myTempHumidity');
              image.src = "public/images/cool.jpg";
              document.getElementById("tempHumidity").innerHTML = "Temp is normal";
              var tempHeader = "Temperature: " + temp;
              document.getElementById("temp").innerHTML= tempHeader;
            }        
       }   break;// end case 3: deviceIOTTempHumidity

    case subscribeTopic.AirQuality:    //start case 4
        {
          console.log ("Backend Received AirQuality status: " + message.payloadString);
          var airQualityStatus = message.payloadString;
          if  (airQualityStatus.toLowerCase() === "smoke_detected"){
              var image = document.getElementById('myAirQualityImage');
              image.src = "public/images/smoke.jpg";
              document.getElementById("airQuality").innerHTML = "Smoke detected";
            }
          if  (airQualityStatus.toLowerCase() === "normal"){
              var image = document.getElementById('myAirQualityImage');
              image.src = "public/images/nothing.jpg";
              document.getElementById("airQuality").innerHTML = "Normal";
            }
            
        }   break;// end case 4: deviceIOTAirQuality

    case subscribeTopic.MotionDetector:    //start case 4
        {
          console.log ("Backend Received AirQuality status: " + message.payloadString);
          var airQualityStatus = message.payloadString;
          if  (airQualityStatus.toLowerCase() === "motion_detected"){
              var image = document.getElementById('motion_detected');
              image.src = "public/images/smoke.jpg";
            }
          if  (airQualityStatus.toLowerCase() === "motion_ended"){
              var image = document.getElementById('motion_detected');
              image.src = "";
            }
            
        }   break;// end case 5: deviceIOTAirQuality

    case subscribeTopic.LightDetector:    //start case 4
        {
          console.log ("Backend Received AirQuality status: " + message.payloadString);
          var airQualityStatus = message.payloadString;
          if  (airQualityStatus.toLowerCase() === "light_detected"){
              var image = document.getElementById('light_detected');
              image.src = "public/images/smoke.jpg";
            }
          if  (airQualityStatus.toLowerCase() === "light_ended"){
              var image = document.getElementById('light_detected');
              image.src = "public/images/smoke.jpg";
            }
            
        }   break;// end case 5: deviceIOTAirQuality
      }  // end swicth  

};  // end onMessageArrived

function closeAllConnnections(){
    message = new Paho.MQTT.Message("ui_control_left");
        message.destinationName = publishTopic.uiControl;
        client.send(message);
    client.disconnect();
}