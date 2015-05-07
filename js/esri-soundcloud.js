
    // Deal with map resizing
    $( window ).resize(function() {
        console.log($(window).height() ,$('#header').height() );
       $("#map").height(

            $(window).height() - $('#header').height() 

        );
       console.log($("#map").height());
    });

    // Initialise soundcloud SDK
    SC.initialize({
      client_id: "368b9122094c1663506e154f15ba776c"
    });
    initializeMap();

    // Initialize Soundcloud mapping
    function initializeMap() {
        
        var MAX_SOUNDS = 100;
        var GENRE = "";
        var SOUNDS = new L.layerGroup();
        var LATLNGS = [];
        var counter = 0;
        var map = L.map('map').setView([0,  20], 3);
        L.esri.basemapLayer('DarkGray').addTo(map);
        L.esri.basemapLayer('DarkGrayLabels').addTo(map);
        var geocoder = new L.esri.Geocoding.Services.Geocoding();
        var markerIcon = L.icon({ iconUrl: 'imgs/marker-icon.png', iconSize: [25, 41]})
        var oms = new OverlappingMarkerSpiderfier(map);
        
        $('#form').on('submit', function(e) {
            e.preventDefault();
            if (SOUNDS) { 
                map.removeLayer(SOUNDS); 
                SOUNDS = new L.layerGroup();
            }

            var LATLNGS = [];
            var data = $("#form :input").serializeArray();
            var GENRE = String(data[0].value).toLowerCase();
            //console.log("Genre: " , GENRE);

            // Find tracks of type genre and limit to max sounds
            SC.get('/tracks', { "tags": GENRE, limit: MAX_SOUNDS }, function(tracks) {
                if (tracks) {
                    tracks.forEach( function(track, index) {
                        SC.get('/users/' + track.user.id , function(userinfo) {
                            var city = userinfo.city;
                            var country = userinfo.country;
                            if (city && city.indexOf("Global") == -1 && city.indexOf("Worldwide") == -1) {
                                var location = city + "," + country;
                    
                                geocoder.geocode().text(location).run(function (error, response) {
                                    var results = response.results;
                                    var oEmbedOptions = { auto_play: false, iframe: true, maxheight: 300, maxwidth: 300}
                                    SC.oEmbed(track.permalink_url, oEmbedOptions, function(oEmbed) {
                                        
                                        if ( oEmbed && oEmbed.html ) {
                                            var player = oEmbed.html
                                            var empty = "This playlist is empty."

                                            // Make sure that there is actually a playlist and a latitude and longitude
                                            if ( results[0] && results[0].latlng && player.indexOf(empty) === -1 )  {
                                                var lat =  results[0].latlng.lat;
                                                var lng =  results[0].latlng.lng;
                                                //console.log(lat, lng);

                                                if ( $.inArray(lat, LATLNGS) > -1 ) {
                                                    var marker = L.marker([lat , lng ], {icon: markerIcon})
                                                    .bindPopup(player)
                                                    SOUNDS.addLayer(marker).addTo(map);
                                                }

                                                else {
                                                    var lat = lat + (Math.random() / 100) 
                                                    var lng = lng + (Math.random() / 100) 
                                                    var marker = L.marker([ lat , lng  ], {icon: markerIcon}).addTo(map);
                                                    var popup = new L.Popup();
                                                    oms.addListener('click', function(marker) {
                                                      popup.setContent(player);
                                                      popup.setLatLng(marker.getLatLng());
                                                      map.openPopup(popup);
                                                    });
                                                    oms.addMarker(marker);  // Spiderify
                                                    SOUNDS.addLayer(marker).addTo(map);
                                                }
                                                //console.log( results[0].latlng.lat, results[0].latlng.lng)
                                                counter += 1
                                                console.log("Adding", counter, lat, lng);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        });
    };