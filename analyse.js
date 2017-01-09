var fbid = document.cookie.match(document.cookie.match(/c_user=(d+)/)[1]);;
var udtsg = document.getElementsByName('fb_dtsg')[0].value;
var friendsLocations = "{ "
function addF(f) {friendsLocations += f;}
function printFL(){console.log(friendsLocations.slice(0,-1)+"}");}
function toBulk(){
  var data = JSON.parse(friendsLocations);
  console.log("Analysing "+size(data)+" friend's data");
  bulk = "";abulk=""; nf=0;
  for (friend in data){
    if (size(data[friend]["coordinates"])>0){
      for (fplace in data[friend]["coordinates"]){
       //bulk += data[friend]["coordinates"][fplace]+" {"+data[friend]["name"]+" - "+fplace+"}n";
       abulk = data[friend]["coordinates"][fplace]+" {"+data[friend]["name"]+" - "+fplace+"}n";
      }
     bulk += abulk;
     nf++;
    }
  }
  console.log(""+nf+" friends geolocated. http://www.mapcustomizer.com/ -> Bulk creation");
  console.log(bulk);
}
function sleep() {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > 2000){
          break;
        }
    }
}
function size(obj) {
    var s = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) s++;
    }
    return s;
}
function locateMsg(msginfo){
  coord = "{ ";
  msg = msginfo["payload"]["actions"]
  for (var i = 0; i < msg.length; i++) { 
     if (msg[i]["coordinates"] != null)
      coord += '"'+msg[i]["timestamp_datetime"]+'":"'+msg[i]["coordinates"]["latitude"]+" "+msg[i]["coordinates"]["longitude"]+'",';//'
  }
  return coord.slice(0,-1)+"}"
}
function parsemsg(targetuser,targetName) {
        function serialize(obj) {
          var str = [ "messages[user_ids]["+targetuser+"][offset]=0","messages[user_ids]["+targetuser+"][limit]=21"];
          for(var p in obj)
             str.push(p + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        }
        var d = new Date();
        var data = {
           "client":"web_messenger",
           "__user":fbid,
           "__a":1,
           "__req":"1r",
           "ttstamp":""+ (new Date().getTime()),
           "fb_dtsg": ""+udtsg
        };
        var req = serialize(data);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', '/ajax/mercury/thread_info.php');
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4) {
            var resp = xmlhttp.responseText.slice(9);
            var msginfo = JSON.parse(resp.replace(/(rn|n|r)/gm,""));
            addF( '"'+targetuser+'":{"name":"'+targetName+'","coordinates":'+locateMsg(msginfo)+'},');
          }
         }
        xmlhttp.send(req);
}
function buddy(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.facebook.com/ajax/chat/user_info_all.php?__user="+fbid+"&__a=1&viewer="+fbid+"", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText.slice(9));
        callback(resp.payload);
      }
    };
    xhr.send();
}
function locateAll() {
    pos = 1;
    buddy(function(buddy_list) {
        buddy_num = size(buddy_list);
        console.log("Friends: "+ buddy_num);
        console.log("It will take "+ ( buddy_num*2)+" seconds");
        for (var id in buddy_list) {
           //console.log(buddy_list[id].name);
           parsemsg(id, buddy_list[id].name);
            if (pos % Math.floor(buddy_num/100) == 0) console.log(Math.floor(pos/(buddy_num/100)) + ' %');
            //if (pos == 15) break;
            pos++;
            sleep();
        }
    });
}
locateAll();

//toBulk(); 
