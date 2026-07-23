// Header logo Function
$(".main_icon").on("click", function () {
  window.location.href = "index.html";
});

let map;
let markers = [];

$(document).ready(function () {
  if ($("#map").length) {
    map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-0.127647, 51.537322],
      zoom: 11,
    });
  }

  var savedRestaurants = JSON.parse(localStorage.getItem("Restaurants"));
  if (savedRestaurants && savedRestaurants.length > 0) {
    display_restaurant_data(savedRestaurants);
  } else {
    console.log("No restaurant data found");
  }
});


mapboxgl.accessToken = "pk.eyJ1Ijoia3JheXppZWphbWFhIiwiYSI6ImNsbTk3N3liNzBoOXgzcHFxcnYxbzFlZGoifQ.CFAObEgH4I_ADDAdhMOR1Q";


$("#search_btn").on("click", function (event) {
  event.preventDefault();
  var searchText = $("#restaurant_name").val().trim();

  if (searchText !== "") {
    fetch_restaurant_details(searchText);
  }
});


$("#restaurant_name").on("keypress", function (event) {
  if (event.which === 13) {
    event.preventDefault();
    var searchText = $("#restaurant_name").val().trim();
    if (searchText !== "") {
      fetch_restaurant_details(searchText);
    }
  }
});


function fetch_restaurant_details(restaurant_name) {
  var apiKey = "3827cbc66amshf758c3e48924cb7p170ae8jsn2a2b032f2a9e";
  var url = "https://local-business-data.p.rapidapi.com/search?query=" + restaurant_name + " london&language=en&rapidapi-key=" + apiKey;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.data && data.data.length > 0) {
        

        markers.forEach(function(marker) {
          marker.remove();
        });
        markers = []; 

    
       data.data.forEach(function(place) {
          if (place.latitude && place.longitude) {
            addMarker(place);
          }
        });

  
        var topResult = data.data[0];
        display_restaurant_html(topResult);

  
        if (map && topResult.latitude && topResult.longitude) {
          map.flyTo({
            center: [topResult.longitude, topResult.latitude],
            zoom: 12, 
            essential: true,
          });
        }

      } else {
        alert("No restaurants found.");
      }
    })
    .catch(function (error) {
      console.error("API Error:", error);
    });
}

function display_restaurant_html(restaurant) {
  var restaurantsection = $('.restaurant_section');
  restaurantsection.empty();
  
  var restaurantName = restaurant.name;
  var restaurant_address = restaurant.full_address;
  var restaurantDes = restaurant.about ? restaurant.about.summary : "No description available.";
  var restaurant_hours = restaurant.working_hours;
  var restaurant_number = restaurant.phone_number || "N/A";
  var restaurant_website = restaurant.website || "#";
  var restaurant_photo = restaurant.photos_sample && restaurant.photos_sample.length > 0 
    ? restaurant.photos_sample[0].photo_url_large 
    : "assets/images/restaurant.jpg";

 
  restaurantsection.append(`
    <div class="container">
      <h2 class="rest_title">Restaurant Details</h2>
      <div class="restaurant_card">
        <div class="row">
          <div class="col-lg-8 col-md-12">
            <div class="restaurant_left_side">
              <h3 class="restaurant_name">${restaurantName}</h3>
              <p class="restaurant_address">${restaurant_address}</p>
              <p class="restaurant_description">${restaurantDes}</p>
              <ul class="restaurant_ul">
                <li><p class="restaurant_hours_link"><a href="#modal_timetable" rel="modal:open">Opening Hours</a></p></li>
                <li><p class="restaurant_number">${restaurant_number}</p></li>
                <li><p class="restaurant_website"><a href="${restaurant_website}" class="restaurant_website_link" target="_blank">Website</a></p></li>
              </ul>
              <div class="resturant_feedback_Section">
                <h4 class="FeedBack_title">Feedback</h4>
                <textarea id="FeedBack_text"></textarea>
                <button class="btn btn-lg" id="submit_feedback">Submit</button>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-12">
            <div class="restaurant_right_side">
              <img src="${restaurant_photo}" class="restaurant_photo" alt="Restaurant Image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  if (restaurant_hours) {
    display_modal(restaurantName, restaurant_photo, restaurant_hours);
  }
}

function display_modal(restaurantName, restaurant_photo, restaurant_hours) {
  $(".modal_section").empty().append(`
    <div id="modal_timetable" class="modal">
      <h3 class="modal_title">${restaurantName}</h3>
      <img src="${restaurant_photo}" class="modal_restaurant_image" alt="Restaurant Image" />
      <div class="mdl_body">
        <h4 class="opening_hour">Opening Hours</h4>
      </div>
    </div>
  `);

  var modal_body = $(".mdl_body");
  for (var day in restaurant_hours) {
    var hoursArray = restaurant_hours[day];
    for (var i = 0; i < hoursArray.length; i++) {
      var modal_li = $("<li>");
      modal_li.text(day + ": " + hoursArray[i]);
      modal_li.attr("class", "modal_li");
      modal_body.append(modal_li);
    }
  }
}

$(document).on("click", "#submit_feedback", function (event) {
  event.preventDefault();
  
  var restaurant_name = $(".restaurant_name").text();
  var restaurant_description = $(".restaurant_description").text();
  var restaurant_website = $(".restaurant_website_link").attr("href");
  var restaurant_photo = $(".restaurant_photo").attr("src");
  var FeedBack_text = $("#FeedBack_text").val();

  $("#FeedBack_text").val("");

  var feedbackData = {
    name: restaurant_name,
    description: restaurant_description,
    website: restaurant_website,
    photo: restaurant_photo,
    feedback: FeedBack_text,
  };

  var existingData = localStorage.getItem("Restaurants");
  var feedbackArray = [];

  if (existingData) {
    try {
      feedbackArray = JSON.parse(existingData);
      if (!Array.isArray(feedbackArray)) {
        feedbackArray = [];
      }
    } catch (error) {
      feedbackArray = [];
    }
  }

  feedbackArray.push(feedbackData);
  localStorage.setItem("Restaurants", JSON.stringify(feedbackArray));
  alert("Restaurant and feedback saved successfully!");
});


function zoomToLocation(latitude, longitude, name, website) {
  if (!map) return;
  map.flyTo({
    center: [longitude, latitude],
    zoom: 15,
    essential: true,
  });
  addMarker(latitude, longitude, name, website);
}

function addMarker(place) {
  if (!map) return;

  var restaurantName = place.name;
  var restaurantWebsite = place.website || "#";
  var latitude = place.latitude;
  var longitude = place.longitude;

  const marker = new mapboxgl.Marker()
    .setLngLat({ lng: longitude, lat: latitude })
    .addTo(map);

  markers.push(marker);

  marker.getElement().addEventListener("click", function () {
    display_restaurant_html(place);
    $([document.documentElement, document.body]).animate({
      scrollTop: $(".restaurant_section").offset().top
    }, 500);
  });
}


function display_restaurant_data(restaurants) {
  var rest_row = $('.rest-row');
  rest_row.empty();

  for (var i = 0; i < restaurants.length; i++) {
    var restaurantName = restaurants[i].name;
    var restaurantDes = restaurants[i].description;
    var restaurant_website = restaurants[i].website;
    var restaurant_photo = restaurants[i].photo;
    var restaurant_feedback = restaurants[i].feedback || "No feedback provided.";

    rest_row.append(`
      <div class="col-lg-4 col-md-6 col-12 mb-4">
        <div class="restaurant_card h-100">
          <img src="${restaurant_photo}" class="rest_list_img img-fluid" alt="Restaurant Image" />
          <div class="restaurant_body p-3">
            <h3 class="rest_name">${restaurantName}</h3>
            <p class="rest_des">${restaurantDes}</p>
            <ul class="rest_ul list-unstyled">
              <li><a href="${restaurant_website}" target="_blank">Website</a></li>
            </ul>
            <p class="feedback_text fw-bold mb-1">FeedBack:</p>
            <p class="Get_feedback">${restaurant_feedback}</p>
          </div>
        </div>
      </div>
    `);
  }
}