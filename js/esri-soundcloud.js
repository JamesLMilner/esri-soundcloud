		$("#map").height( $(window).height() - $('#header').height() );
			
			
			
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
			
			SC.initialize({
			  client_id: "KEY GOES HERE!"
			});
			$(function() {
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
						//console.log(tracks);
						if (tracks) {
							tracks.forEach( function(track, index) {
							
								//console.log('/tracks/' + track.user.id);
								SC.get('/users/' + track.user.id , function(userinfo) {
									if (userinfo.city && userinfo.city.indexOf("Global") == -1) {
                                        //console.log(userinfo.city)
                                        //console.log(geocoder);
                                        var location = userinfo.city + "," + userinfo.country
                                        geocoder.geocode().text(location).run(function (error, response) {
                                            var results = response.results;
                                            //console.log(error, results);
											//console.log(results[0].permalink_url)
											//console.log(track.permalink_url);
											SC.oEmbed(track.permalink_url, { auto_play: false, iframe: true, maxheight: 300, maxwidth: 300}, function(oEmbed) {
											
												//console.log(oEmbed);
												if ( oEmbed && oEmbed.html ) {
                                                    console.log("oEmbed is true");
													player = oEmbed.html
											
													// Make sure that there is actually a playlist and a latitude and longitude
													if ( results[0] && results[0].latlng && player.indexOf("This playlist is empty.") === -1 )  {
														var lat =  results[0].latlng.lat;
														var lng =  results[0].latlng.lng;
                                                        console.log(lat, lng);
														
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
														console.log( results[0].latlng.lat, results[0].latlng.lng)
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
			});
			

			$( window ).resize(function() {
				console.log($(window).height() ,$('#header').height() );
			   $("#map").height(
					
					$(window).height() - $('#header').height() 

				);
			   console.log($("#map").height());
			});