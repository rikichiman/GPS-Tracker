$(document).ready(function()
{
    var defaultref ;
    var marker;
    var mymap;
    var latlng;
    var markerGroup;
    var markers = [];
    var targets;
    var positions = [];
    var line = null;
    var polygone = null;
    var currentTarget = null;
    var titleStreet , mode = "map";
    var dir , layer;
    var lastPosition = null;
    var popup = L.popup();


    function initMap(latlng , z)
    {
      
      titleStreet = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Omar Izem & Ayman Drif'

        });

      //initialise Leaflet
      mymap = L.map('divmap' , 
      {
        layers: titleStreet,
        center: latlng,
        zoom: z
      });
  
  var editableLayers = new L.FeatureGroup();
  mymap.addLayer(editableLayers);
  
  
  var options = {
      position: 'topleft',
      draw: {
          polyline: {
              shapeOptions: {
                  color: '#f357a1',
                  weight: 10
              }
          },
          polygon: {
              allowIntersection: false, // Restricts shapes to simple polygons
              drawError: {
                  color: '#e1e100', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
              },
              shapeOptions: {
                  color: '#bada55'
              }
          },
          circle: true, // Turns off this drawing tool
          rectangle: {
              shapeOptions: {
                  clickable: false
              }
          },
          marker: false
      },
      edit: {
          featureGroup: editableLayers, //REQUIRED!!
          remove: true
      }
  };
  
  var drawControl = new L.Control.Draw(options);
  mymap.addControl(drawControl);
  
  mymap.on(L.Draw.Event.CREATED, function (e) {
          layer = e.layer;
          editableLayers.addLayer(layer);
  });


        marker = L.marker(latlng).addTo(mymap); 

      //add layers
      L.control.layers({
        'Map': titleStreet,
        'Satellite': MQ.satelliteLayer(),
        'Dark': MQ.darkLayer(),
        'Light': MQ.lightLayer(),
      }).addTo(mymap);

    }

    navigator.permissions.query({name:'geolocation'}).then(function(result) {
      // Will return ['granted', 'prompt', 'denied']
      if( result.state == "granted" )
      {
          // get current location of navigator and initialise the leaflet
          navigator.geolocation.getCurrentPosition(function(location) {
            lastPosition = null;
            //current location
            latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
            
            initMap(latlng , 15);
                // set popup
                popup
                .setLatLng(latlng)
                .setContent( "This is your position")
                .openOn(mymap);
          });

      }else if( result.state == "denied" ){
  
        latlng = new L.LatLng( 33.9716 , -6.8498 );
            initMap(  latlng , 5);
           mymap.removeLayer(marker);
      }

    });


      //receiving position of targets
      $("#selectlist").change(function (e) {

        mymap.removeLayer(popup);
        //check if the user is onLine
        if( navigator.onLine )
        {
          //mymap.removeLayer(layer);
        // here if user change selected target we will clear group of markers
          if( markerGroup != undefined)
          {
            mymap.removeLayer(markerGroup);
            markerGroup = null;
          }

          // here we will clear array of position from position of last target
          if( positions.length > 0 )
          {
            positions = [];
            if( line != undefined )
            {
              mymap.removeLayer(line);
            }
          }

          if( polygone != undefined )
          {
            mymap.removeLayer(polygone);  
          }
        
        if( $("#selectlist").val() != "all" )
        {
          markers = null;
                        // Get a reference to the database service
                        defaultref = firebase.database().ref("users/"+sessionStorage.userId+ "/"+$("#selectlist").val());
                        // create listener on firebase for defaultref
                        defaultref.on('value', function(snapshot) {
                          // check if we can track our target
                          if( snapshot.val().connected == true && snapshot.val().opentrack == true &&  $("#r_live").attr("checked") == "checked")
                          {
                            if( snapshot.key == $("#selectlist").val() )
                            {
                                // here we check if target is already selected to skip defining zoom
                                if( currentTarget != snapshot.key)
                                {
                                  // set view of maps without zoom
                                  mymap.flyTo([snapshot.val().lat , snapshot.val().long]);
                                  currentTarget = snapshot.id;
                                  
                                }else{
                                  // set view of maps with zoom
                                  mymap.setView([snapshot.val().lat , snapshot.val().long], 10);

                                  // set popup
                                  popup
                                  .setLatLng([snapshot.val().lat , snapshot.val().long])
                                  .setContent( $("#selectlist").find(":selected").text() )
                                  .openOn(mymap);
                                  currentTarget = snapshot.id;
                                }
                                
                                // define position of marker
                                marker.setLatLng([snapshot.val().lat , snapshot.val().long]).addTo(mymap);

                                // to draw plyline
                                if( line != undefined )
                                {
                                  mymap.removeLayer(line);
                                }

                                if( polygone != undefined )
                                {
                                  mymap.removeLayer(polygone);
                                }

                                lastPosition = new L.LatLng(snapshot.val().lat , snapshot.val().long);
                                positions.push([snapshot.val().lat , snapshot.val().long]);
                                line = L.polyline(positions, {color: 'red'}).addTo(mymap);
                            }

                            $("#selectedTarget").html($("#selectlist").find(":selected").text());
            
                          }
                          else // if target is offline or closed gps
                          { 
                            if( $("#r_live").attr("checked") == "checked" )
                            {
                                                            // when listener get data from firebase we check 
                            if( snapshot.key == $("#selectlist").val() )
                            {
                            // show notification
                            $("body").append("<div class='alert'>Sorry we can't track " + $("#selectlist").find(":selected").text() + "</div>");
                            new Audio('../songs/notification.mp3').play();
                            $(".alert").click(function()
                            {
                                $(this).remove();
                            });
                            // create reference  for last postion                        
                            var lastRef = firebase.firestore().collection("Profiles").doc(sessionStorage.userId + "/cibles/" + $("#selectlist").val() + "/connections/lastcon");
                            lastRef.get().then(function(lastcon) {
                              //$("#selectlist").val("Choose here");
                              //$("#selectlist option[value='Choose here']").attr('selected' , 'selected');
                              // here we verifie if document exist  or not
                              if (lastcon.exists) {
                                    // here we check if target have an history or not
                                    if( lastcon.data().lat != 0 && lastcon.data().long != 0)
                                    {
                                          marker.setLatLng([lastcon.data().lat , lastcon.data().long]).addTo(mymap);
                                          mymap.flyTo([lastcon.data().lat , lastcon.data().long]);
                                          //set popup
                                          popup
                                          .setLatLng([lastcon.data().lat , lastcon.data().long])
                                          .setContent( "This is last position of " + $("#selectlist").find(":selected").text() )
                                          .openOn(mymap);

                                    }else{ // if target don't have history we will show position of the user
                                      navigator.geolocation.getCurrentPosition(function(location) {
                                        lastPosition = null;
                                        //current location
                                        latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
                                        marker.setLatLng(latlng).addTo(mymap);
                                        mymap.flyTo(latlng);
                                        //set popup
                                        popup
                                        .setLatLng(latlng)
                                        .setContent( "This is your position switch to an other target except " +  $("#selectlist").find(":selected").text() + "  ")
                                        .openOn(mymap);
                                      });

                                    }
                              }else // if document don't exist
                              {
                                mymap.removeLayer(marker);
                                navigator.geolocation.getCurrentPosition(function(location) {
                                  //current location
                                  latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
                                  marker.setLatLng(latlng).addTo(mymap);
                                  mymap.flyTo(latlng , 15 , true);
                                  //set popup
                                  popup
                                  .setLatLng(latlng)
                                  .setContent( "This is your position switch to an other target except " +  $("#selectlist").find(":selected").text() + "  ")
                                  .openOn(mymap);
                                });
                              }

                            });
                            }
                          }
                          }
                        });
        }else{ // if the user want to show all targets

          mymap.removeLayer(marker);
                  //load an object Json of all targets
                  firebase.firestore().collection("Profiles/" + sessionStorage.userId + "/cibles")
                  .get()
                  .then(function(querySnapshot) {

                    targets = new Array(); // array content all targets used to get offset of marker
                    markers = new Array(); // array of marker ( marker for each target )
                    markerGroup = L.layerGroup();

                     if( querySnapshot != null ) // check if user have any target
                      {
                          querySnapshot.forEach(function(snapshot) {

                            var nbrelt = targets.length; // get last ofsset of target
                            targets[nbrelt] = snapshot.id; // id return name of document

                              // create reference foreach target
                              var refall = firebase.database().ref("users/"+ sessionStorage.userId+ "/"+ snapshot.id);                             
                              //retreive data to track new target
                              refall.on('value', snap => {

                                if( snap.val().connected && snap.val().opentrack)
                                {
                                      // draw polyline
                                      if( polygone != undefined)
                                      {
                                        mymap.removeLayer(polygone);
                                      } 
                                      positions.push([snap.val().lat , snap.val().long]);

                                          //retreive data to track new target
                                          if( markers[targets.indexOf(snap.key)] == undefined )
                                          {
                                            markers[targets.indexOf(snap.key)] =  new L.marker(
                                              [snap.val().lat , snap.val().long],
                                              {
                                                title: getPseudo(snap.key),
                                                riseOnHover: true,
                                            });
        
                                            markerGroup.addLayer(markers[targets.indexOf(snap.key)]).bindPopup(
                                              getPseudo(snap.key) , {
                                                autoClose:false
                                              });

                                      }else{
                                        markers[targets.indexOf(snap.key)].setLatLng([snap.val().lat , snap.val().long]);
                                      }

                                      polygone = L.polygon(positions, {color: '#ff020254'}).addTo(mymap);
                                      // zoom the map to the polyline
                                      //mymap.fitBounds(polygone.getBounds());
                                      mymap.flyToBounds(polygone.getBounds());

                                      popup
                                      .setLatLng([snap.val().lat , snap.val().long])
                                      .setContent(snap.key)
                                      .openOn(mymap);

                                }else{ // if target is ofline

                                  $("body").append("<div class='alert'>Sorry we can't track " + snapshot.id + "</div>");
                                  new Audio('../songs/notification.mp3').play();
                                  $(".alert").click(function()
                                  {
                                      $(this).remove();
                                  });

                                }
                              });

                            });

                            //add group of markers to map
                            markerGroup.addTo(mymap);
                      }else{
                        firebase.auth().signOut().then(function() {
                          sessionStorage.clear();
                         $(location).attr("href" , '../404.html');
                      });
                      }
                  })
                  .catch(function(error) {

                    if( error.includes("offline") )
                    {
                        alert("you're offline");
                    }
                    else
                    {
                      
                      firebase.auth().signOut().then(function() {
                        sessionStorage.clear();
                        $(location).attr("href" , '../404.html');
                      });

                    }

                  });
        }

      }else
      {
        $("#selectlist").append("<option value='' selected disabled hidden>Choose here</option>");
        navigatorOffline();
      }
          
      });


    // locat me
    $(".locatme").click(function()
    {
              if( /*navigator.onLine &&*/ navigator.geolocation)
                {
                      if( markerGroup != undefined)
                      {
                        mymap.removeLayer(markerGroup);
                        markerGroup = null;
                      }

                      if( positions.length > 0 )
                      {
                        positions = [];
                        if( polygone != undefined )
                        {
                          mymap.removeLayer(polygone);
                        }
                      }

                      marker.remove();
                      destroyData();
                      var options = {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0       
                      };

                      function error(err) {
                        alert('ERROR(' + err.code + '): ' + err.message);
                      };
                              navigator.geolocation.getCurrentPosition(function(location) {

                                lastPosition = null;
                                  //current location
                                  latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
                                  marker.setLatLng(latlng).addTo(mymap);
                                  //mymap.setView(latlng);
                                  mymap.flyTo(latlng);
                                  //set popup
                                popup
                                  .setLatLng(latlng)
                                  .setContent( "This is your position ")
                                  .openOn(mymap);
                      }, error , options  );

                      $("#selectlist").append("<option value='' selected disabled hidden>Choose here</option>");

                  }else
                    {
                      navigatorOffline();
                    }

          });



 /* $("#shortPath").click(function () { 
    navigator.geolocation.getCurrentPosition(function(location) {
      lastPosition = null;
      //current location
      latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
      var markerpos = marker.getLatLng();

      direction(latlng.lat , latlng.lng , markerpos.lat , markerpos.lng);
    });
   });

   function direction(lat1 , long1 , lat2 , long2)
   {
 
     dir = MQ.routing.directions();
 
     dir.route({
         locations: [
           lat1 + ' , ' + long1 ,
           lat2 + ' , ' + long2,
         ]
     });
     
     layer = MQ.routing.routeLayer({
      directions: dir,
      fitBounds: true
    });
     mymap.addLayer(layer);

  }*/

   function getPseudo(idCible)
   {
        firebase.firestore().collection("Profiles").doc(sessionStorage.userId + "/cibles/" + idCible)
        .get().then(function(querySnapshot) {
                if( querySnapshot != null)
                return querySnapshot.data().pseudo;
        });
    
  }


  // track the history
  $( 'input[type="radio"][name="live_history"]' ).on('change' , function()
  {
        if( $(this).val() == "history" )
        {
          lastPosition = marker.getLatLng();

          if($("#selectlist").find(":selected").text() != "Choose here" && $("#selectlist").find(":selected").text() != "all")
          {
            firebase.firestore().collection("Profiles").doc(sessionStorage.userId + "/cibles/" + $("#selectlist").val()).collection("history/")
            .get().then( history => {

              if( SizeObj(history) > 0  )
              {
                $("#du").html('<option value="choisir la date" selected disabled hidden>choisir la date</option>');
                $("#definePeriode").show();

                  // fetch days 
                  history.forEach(function(day){
                  
                    firebase.firestore().collection("Profiles").doc(sessionStorage.userId + "/cibles/" + $("#selectlist").val()).collection("history/")
                    .doc(day.id).get()
                    .then( snap => {

                            for( moment in snap.data())
                            {     
                                var StringMoment = moment.toString();
                                if( StringMoment.length > 0)
                                {
                                      var option1 = document.createElement('option');
                                      var option2 = document.createElement('option');
                                      option1.value = day.id;
                                      option2.value = day.id;
                                      option1.innerText = day.id;
                                      option2.innerText = day.id;
                
                                      $("#du").append(option1);
                                      $("#au").append(option2);
                                      break;
                                }
                            }

                    });

                  });
                
              }else{
                    $("body").append("<div class='alert'> " + $("#selectlist").find(":selected").text() + " don't have any history</div>");
                    new Audio('../songs/notification.mp3').play();
                    $(".alert").click(function()
                    {
                        $(this).remove();
                    });
              }

            });
          }

        }else if( $(this).val() == "live" )
        {
            destroyData();
            
            marker = L.marker(lastPosition).addTo(mymap);
            mymap.flyTo(lastPosition);
            lastPosition = null;
        }

});

        // drawing history plyline
        $(".date").change(function(){

              if( $("#du").find(":selected").text() != "choisir la date" )
              {
                              var Dref = firebase.firestore().collection("Profiles").doc(sessionStorage.userId + "/cibles/" + $("#selectlist").val()).collection("history/");
                              
                              Dref.get().then( history => {
      
                                if( SizeObj(history) > 0  )
                                {
                                    history.forEach( day => {
                                          var IntDay = day.id.split('-');
                                          if( IntDay.length == 3)
                                          {
                                                if(  $("#du").find(":selected").text() == day.id )
                                                {

                                                  destroyData();
                                                      Dref.doc(day.id).get()
                                                      .then( snap => {
                                                              destroyData(false);
                                                              for( moment in snap.data())
                                                              {     
                                                                    var StringMoment = moment.toString();
                                                                    positions.push( [ snap.data()[StringMoment].latitude , snap.data()[StringMoment].longitude ] );
                                                                    destroyData(false);
                                                                    line = L.polyline(positions, {color: 'red'}).addTo(mymap);
                                                              }
                                                              mymap.flyToBounds(line.getBounds());
                                                      });

                                                }
                                          }
                                    });
      
                                }else
                                {
                                      $("body").append("<div class='alert'>la cible " + $("#selectlist").find(":selected").text() + " n'a aucun historique dans cette période</div>");
                                      new Audio('../songs/notification.mp3').play();
                                      $(".alert").click(function()
                                      {
                                          $(this).remove();
                                      });
                                }

                              });
                      }

        });

      function SizeObj(obj)
      { var count = 0;
            obj.forEach(function(){
            ++count;
          });
          return count;
      }



      function destroyData(boolPosition = true , boolMarker = true , boolMarkerGroup = true , boolPolygon = true , boolLine = true)
      {
            
          if( markerGroup != undefined && boolMarkerGroup == true)
          {
            mymap.removeLayer(markerGroup);
            markerGroup = null;
          }

          if( line != undefined && boolLine == true)
                  mymap.removeLayer(line);
          if( positions.length > 0 && boolPosition == true)
          {
            positions = [];
          }

          if( polygone != undefined && boolPolygon == true)
            mymap.removeLayer(polygone);

          if( marker != undefined && boolMarker == true)
            marker.remove();  
      }

      var ps = placeSearch({
        key: '5tGrkZevZN0JXYL1EJ3H3URNTG9U0moG',
        container: document.querySelector('#place-search-input'),
        useDeviceLocation: false,
        collection: [
          'poi',
          'airport',
          'address',
          'adminArea',
        ]
      });
     
         ps.on('change' , (e) =>{
                destroyData();
                //$("#selectlist").append("<option value='' selected disabled hidden>Choose here</option>");
                marker = marker.setLatLng(e.result.latlng).bindPopup(e.city).addTo(mymap);
                mymap.flyTo(e.result.latlng);
     
          });

          ps.on('clear' , (e) =>{

                        if( (lastPosition != null || lastPosition != undefined) && $("#selectlist").find(":selected").text() != "all")
                        {
                            destroyData();
                            
                            popup.setLatLng(lastPosition)
                            .setContent($("#selectlist").find(":selected").text() + " " + lastPositiaon.toString())
                            .openOn(mymap);

                            marker = marker.setLatLng(lastPosition).addTo(mymap);
                            mymap.flyTo(lastPosition);

                        }else
                        {
                          $("#selectlist").append("<option value='' selected disabled hidden>Choose here</option>"); 
                        }
          });

});