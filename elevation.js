// Establishes global variables
let title = document.getElementById("title");
let locationButton = document.getElementById("locationButton");
let coordinatesElem = document.getElementById("coordinates");
let elevationElem = document.getElementById("elevation");

title.style.display = "block";

// Displays the location button if the user has not already granted the location permission
if (typeof localStorage["authorizedGeoLocation"] == "undefined" || localStorage["authorizedGeoLocation"] == "0" ) {
    locationButton.style.display = "block";
// Else, proceeds with getting coordinates and elevation
} else {
    locationButton.style.display = "none";
    getData();
}

// Adds a click event handler to the location button
locationButton.addEventListener("click", function() {
    // Checks if the browser supports the geolocation API
    if (navigator.geolocation) {
        // Requests location permission
        navigator.geolocation.getCurrentPosition(success, error);
        locationButton.style.display = "none";
        getData();
    // Else, displays message indicating the user's browser is not supported    
    } else {
        locationButton.style.display = "none";
        coordinatesElem.innerHTML = "Geolocation is not supported by this browser.";
    }
}, false);

// Sets a value in local storage to to 1 if the location permission is granted
function success() {
    localStorage["authorizedGeoLocation"] = 1;
}

// Sets a value in local storage to to 0 if the location permission is denied
function error() {
    localStorage["authorizedGeoLocation"] = 0;
}

// Gets the coordinates and elevation all in one
function getData() {
    navigator.geolocation.getCurrentPosition(function(position) {
        // Gets the latitude and longitude coordinates and displays them to the user
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        coordinatesElem.innerHTML = "Latitude: " + latitude.toString().substring(0, 10) + "<br>Longitude: " + longitude.toString().substring(0, 10);
        getElevation(latitude, longitude);
    });
}

// Gets the elevation using the user's given latitude and longitude coordinates
function getElevation(latitude, longitude) {
    // Generates a HTTP GET request string for USGS' Elevation Point Query Service
    let getRequest = "https://nationalmap.gov/epqs/pqs.php?x=" + longitude + "&y=" + latitude + "&units=Feet&output=json";
    // Gets the JSON from the request using jQuery with the JSON stored in data
    $.getJSON(getRequest, function(data) {
        // Gets the elevation from the JSON
        let elevation = data.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation;
        // Tries the second API because USGS doesn't have elevation data for that location
        if (elevation == "-1000000") {
            // Generates a HTTP GET request string for Elevation-API
            getRequest = "https://elevation-api.io/api/elevation?points=(" + latitude + "," + longitude + ")&key=Cv5dd2ItLb3d8YJbzL-b0AtWD-t03x";
            $.getJSON(getRequest, function(data) {
                // Gets the elevation from the JSON
                elevation = data.elevations[0].elevation;
                // Indicates if no elevation data is available for this location
                if (elevation == "-9999") {
                    elevationElem.innerHTML = "Unfortunately, elevation data is not available for your location.";
                } else {
                    elevationElem.innerHTML = elevation + " m";
                }
            });
        } else {
            elevationElem.innerHTML = elevation + " ft";
        }
    });
}
