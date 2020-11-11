// HTML Class names use hyphen-separated-names
// HTML ID names use camelCaseNames
let markerList = [];
let testList = [
{
  colour: '#fff',
  title: 'All',
},
{
  colour: '#ff3d0d',
  title: 'Childcare',
},
{
  colour: '#ff7a0d',
  title: 'Community Centre',
},
{
  colour: '#ffd70d',
  title: 'Cultural Sites',
},
{
  colour: '#c7ff0d',
  title: 'Dentist',
},
{
  colour: '#30db0d',
  title: 'Doctors Surgery',
},
{
  colour: '#17ff7f',
  title: 'Education',
},
{
  colour: '#00ffbf',
  title: 'Health',
},
{
  colour: '#00b3ff',
  title: 'Hospital / A&E',
},
{
  colour: '#1100ff',
  title: 'Library',
},
{
  colour: '#7600c9',
  title: 'Practical Life',
},
{
  colour: '#c900a7',
  title: 'Transport',
},
{
  colour: '#ff5988',
  title: 'Other',
},
];
let someMarkers = [
  {
    name: 'University Surgery',
    position: {
      lat: 50.795302,
      lng: -1.096070,
    },
    category: 'Health',
    description: "If you get stabbed, this place probably won't do",
  },
  {
    name: 'Portland Building',
    position: {
      lat: 50.798538,
      lng: -1.099235,
    },
    category: 'Education',
    description: 'Home to the FTC',
  },
  {
    name: 'University Library',
    position: {
      lat: 50.793935,
      lng: -1.097785,
    },
    category: 'Library',
    description: "Idk. It's a library",
  }
]
let currentCategories = ['All'];
let map;
let userType = null;
let infoWindow;
const MAP_MARKER = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';

// Initialize the map
function initMap() {


  // Creating the map
  map = new google.maps.Map(document.getElementById("map"), {
    //zoom: 10,
    //center: {lat: jsonTags[0].lat, lng: jsonTags[0].lon},
  });
  if (!centreMapOnUser()) {
    map.setCenter({lat: 40.866667, lng: 34.566667});
    map.setZoom(3);
  }



  // Creating a filters list
  let filterList = document.createElement('ul');
  filterList.id = 'mapFilterList';
  filterList.classList.add("custom-map-control-text-box");
  filterList.innerHTML = 'Filters:'
  filterList.hidden = true;
  document.getElementById('filterContainer').appendChild(filterList);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('filterContainer'));
  addButtons(testList);

  // Add div loginBox to map controls so it can be used in full screen mode
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('loginBox'));
}

// Handle errors with Geolocation
function handleLocationError(browserHasGeolocation, err = null) {

  if (browserHasGeolocation) {
    let message = "Error: The Geolocation service failed."
    if (err) {
      message = message + `\n${err.message}`;
    }
    window.alert(message);
  } else {
    window.alert("Error: Your browser doesn't support geolocation.")
  }
}

// Add buttons to the map screen
function addButtons(optionList) {
  // Add button to pan to current location
  const locationButton = document.createElement("button");
  // Insert the my_location google icon
  locationButton.innerHTML = '<i class="material-icons">my_location</i>';
  locationButton.classList.add("custom-map-control-button", "custom-map-control-icon");
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
  locationButton.addEventListener('click', () => {centreMapOnUser();});

  // Add a login button to the map
  const mapLoginButton = document.createElement('button');
  mapLoginButton.classList.add("custom-map-control-button");
  mapLoginButton.id = 'mapLoginButton';
  mapLoginButton.textContent = 'Login';
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapLoginButton);
  // When pressing login button, hide button and unhide loginBox
  mapLoginButton.addEventListener('click', () => {
    userType = "user";
    document.getElementById('mapLoginButton').style.display = 'none';
    document.getElementById('loginBox').hidden = false;
  });

  // Add the filter buttons that go below the map
  optionList.forEach(function(entry) {
    let btn = document.createElement('button');
    btn.classList.add('filter-button','btn')
    btn.id = entry.title;
    btn.innerHTML = entry.title;
    btn.style.backgroundColor = entry.colour;
    document.getElementById('buttonsPanel').appendChild(btn);
    // When a button is clicked, the filter should either be added to the list or taken away from the list
    btn.addEventListener('click', (event) => {filterToggled(event)});
  });
}

// Load all markers
async function loadMarkers() {

  // Figure out what map is being loaded

  // Fetching the co-ordinates of the markers
  // Redundant for testing right now
  const jsonTags = await getJSONFromLink('/coords')
  .catch(e => {console.log(e)});

  // Procedurally creating the markers
  someMarkers.forEach(function(entry) {
    let newMarker = new google.maps.Marker({
      title: entry.name,
      position: entry.position,
      category: entry.category,
      description: entry.description,
      icon: {
        path: MAP_MARKER,
        fillColor: '#000',
        fillOpacity: 1,
        strokeColor: '#fff',
        anchor: { x: 12, y: 24 },
        scale: 2,
      },
      map: map,
    });
    // Apply colour based on category
    testList.forEach(function(colourEntry) {
      if (newMarker.category == colourEntry.title) {
        newMarker.icon.fillColor = colourEntry.colour;
      }
    });
    newMarker.addListener('click', () => {markerSelected(newMarker);});
    markerList.push(newMarker);
  })

}

// Send Fetch request to API
async function getJSONFromLink(link) {
  let response = await fetch(link, {
    method: 'GET',
  });
  if (!response.ok) throw response;
  let resData = await response.json();
  return resData;
}

// Move the map so that the user's current location is in the centre of the screen
function centreMapOnUser() {

  // Try HTML5 Geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        moveMapTo(pos);
        return true;
      },
      (err) => {
        // An error stopped geolocation from working
        handleLocationError(true, err);
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false);
  }
}

// Fuction called when a marker is clicked on
function markerSelected(marker) {

  moveMapTo(marker.getPosition(), 16);
  if (infoWindow) {
    infoWindow.close();
  }
  infoWindow = new google.maps.InfoWindow({
    content:
    `
    <div class=map-marker-infowindow>
    <h2>${marker.title}</h2>
    <h3>${marker.category}</h3>
    <p>${marker.description}</p>
    </div>`,
  });
  infoWindow.open(map, marker);

}

// Change map centre to passed in position in form {lat: x, lng: y}
function moveMapTo(position, zoom = 13) {
  map.setCenter(position);
  map.setZoom(zoom);
}

// Call function when a filter button is pressed
function filterToggled(event) {
  let listItems = document.getElementById('mapFilterList').childNodes;
  let hasBeenRemoved = false;
  listItems.forEach(function(entry) {
    if (entry.textContent == event.toElement.textContent) {
      entry.remove();
      hasBeenRemoved = true;
      if (listItems.length == 1) {
        document.getElementById('mapFilterList').hidden = true;
      }
    }
  });
  if (!hasBeenRemoved) {
    let newItem = document.createElement('li');
    newItem.textContent = event.toElement.textContent;
    newItem.style.backgroundColor = event.toElement.style.backgroundColor;
    document.getElementById('mapFilterList').appendChild(newItem);
    if (document.getElementById('mapFilterList').hidden) {
      document.getElementById('mapFilterList').hidden = false;
    }
  }
}

// This is the general login handler
function handleLogin() {
  let email = document.getElementById('loginEmail').value;
  let password = document.getElementById('loginPassword').value;

  userType = 'user';

  document.getElementById('loginBox').hidden = true;

  loadMarkers();
}

function addEventListeners() {
  // When closing the login box, hide div and unhide loginButton
  document.getElementById('loginBoxCloseButton').addEventListener('click', function() {
    document.getElementById('loginBox').hidden = true;
    document.getElementById('mapLoginButton').style.display = 'block';
  });

  // Add login handler to the login button
  document.getElementById('loginFormButton').addEventListener('click', () => {handleLogin();});
};

addEventListeners();
