var markers = [];

var defaultLocation = {
    lat: 51.507222,
    lng: -0.1275
};

function initialize() {
    initMap();
}

function initMap(){
    var options = {
        enableHighAccuracy: false,
        timeout: 500,
        maximumAge: 0
    };
    var location;
    function success(pos) {
        location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
        displayMap();
    }

    function error() {
        location = {
            lat: defaultLocation.lat,
            lng: defaultLocation.lng
        };
        displayMap();
    }
    function displayMap(){
        var mapOptions = {
            //gestureHandling: 'cooperative',
            center: location,
            zoom: 15
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        //TODO Implement that initSearchBox();
    }
    //TODO found a way to load it and ask location permission properly
    navigator.geolocation.getCurrentPosition(success, error, options);

}

google.maps.event.addDomListener(window, 'load', initialize);
$(".closetome").click(function() {

})






function initSearchBox(){
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        clearMarkers();

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: "img/pinpint.png",
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function clearMarkers(location){
    var length = markers.length;
    for (var i = 0; i < length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}



var id;
var markers = [];

function initialize() {
    var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };
    id = navigator.geolocation.watchPosition(success, error, options);
}

function success(pos) {
    var location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    };
    initMap(location);
    navigator.geolocation.clearWatch(id);
}

function error() {
    var location = {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng
    };
    initMap(location);
    navigator.geolocation.clearWatch(id);
}


function initMap(location) {
    var mapOptions = {
        center: location,
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    placeMarkers(location)
}

function placeMarkers(location) {
    var request = {
        location: location,
        radius: '5000',
        types: ['bar']
    };
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];

                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    //icon: "img/pinpint.png"
                });
                marker.data = place;
                google.maps.event.addListener(marker, 'click', function () {
                    console.log(this.data);
                    infowindow.setContent('<div><strong>' + this.data.name + '</strong><br>' +
                        'Rating: ' + this.data.rating + '<br>' +
                        this.data.formatted_address + '</div>');
                    infowindow.open(map, this);
                });
                markers.push(marker);
            }
            initSearchBox();
        }

    });
}

function initSearchBox(){
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        clearMarkers();

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function clearMarkers(location){
    var length = markers.length;
    for (var i = 0; i < length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}
