var api_key = "AIzaSyD1wu0c5kRaHUH7SvyTT8fpV01S-vFMemI";
var markers = [];


function getQuickLocation(success) {
    //TODO Need to understand this code and improve it
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var geolocation = JSON.parse(xhttp.responseText).location;
            if (xhttp.readyState == 4 && (xhttp.status == 403 || xhttp.status == 500)) {
                el.innerHTML += 'Sorry! Our Google Geolocation API Quota exceeded. Maybe refresh the page to try again.';
            }
            success(geolocation);
        }
    };
    xhttp.open("POST", "https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key, true);
    xhttp.send();
}

function getPreciseLocation(success) {
    var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };

    function localSuccess(pos) {
        var location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
        success(location);
        $(".location-loading").hide();
    }

    //TODO better error for user
    function localError(err) {
        console.warn(err);
        alert("Your location could not be determined\n" + err.message);
        $(".location-loading").hide();
    }

    navigator.geolocation.getCurrentPosition(localSuccess, localError, options);
    $(".location-loading").show();
}

function updateMap(location) {
    var mapOptions = {
        center: location,
        zoom: 15
    };
    clearMarkers();
    if (typeof map.setCenter !== "undefined") {
        map.panTo(location);
        map.setZoom(mapOptions.zoom);
        placeMarkers(location);
    } else {
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        placeMarkers(location);
    }
}

function placeMarkers(location) {
    var request = {
        location: location,
        radius: '2000',
        type: ['bar']
    };
    var infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];

                var icon = {
                    url: "img/pinpint.png",
                    size: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(50, 50)
                };
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    icon: icon
                });
                marker.data = place;
                google.maps.event.addListener(marker, 'click', function () {

                    var PlaceService = new google.maps.places.PlacesService(map);
                    PlaceService.getDetails({
                        placeId: this.data.place_id
                    }, function (placeDetail, status) {
                        for (var j = 0; j < markers.length; j++) {
                            if (markers[j].data.place_id === placeDetail.place_id) {
                                if (status === google.maps.places.PlacesServiceStatus.OK) {
                                    infowindow.setContent('<div><strong>' + placeDetail.name + '</strong><br>' +
                                        'Google rating: ' + placeDetail.rating + '<br>' +
                                        'WebSite: <a href="' + placeDetail.website + '" target="_blank">click here</a><br>' +
                                        placeDetail.formatted_address + '</div>');
                                    infowindow.open(map, markers[j]);
                                }
                            }
                        }
                    });
                });
                markers.push(marker);
            }
        }

    });
}

function clearMarkers() {
    var length = markers.length;
    for (var i = 0; i < length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

$(document).ready(function () {
    getQuickLocation(updateMap);

    $(".closetome").click(function () {
        getPreciseLocation(updateMap);
    });
});
