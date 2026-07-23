document.addEventListener("DOMContentLoaded", () => {
  const restRow = document.querySelector(".rest-row");

  const visitedRestaurants = JSON.parse(localStorage.getItem("Restaurants")) || [];

  restRow.innerHTML = "";

  if (visitedRestaurants.length === 0) {
    restRow.innerHTML = `<p class="text-muted">No visited restaurants added yet. Search and save some from the map!</p>`;
    return;
  }

  visitedRestaurants.forEach((restaurant) => {
    const colDiv = document.createElement("div");
    colDiv.className = "col-lg-4 col-md-6 col-12 mb-4";

    // Use the saved 'photo' property, with a fallback image if it's missing
    const restaurantPhoto = restaurant.photo || "assets/images/restaurant.jpg";

    colDiv.innerHTML = `
      <div class="restaurant_card h-100">
        <img src="${restaurant.photos_sample && restaurant.photos_sample.length > 0 
    ? restaurant.photos_sample[0].photo_url_large 
    : "assets/images/restaurant.jpg"}" class="rest_list_img img-fluid" alt="Restaurant Image" />
        <div class="restaurant_body p-3">
          <h3 class="rest_name">${restaurant.name}</h3>
          <p class="rest_des">${restaurant.description || 'No description available.'}</p>
          <ul class="rest_ul list-unstyled">
            <li><p class="rest_hours">Hours Today: ${restaurant.hours || 'N/A'}</p></li>
            <li><a href="${restaurant.website || '#'}" target="_blank">Website</a></li>
          </ul>
          <p class="feedback_text fw-bold mb-1">FeedBack</p>
          <p class="Get_feedback">${restaurant.feedback || 'No feedback yet.'}</p>
        </div>
      </div>
    `;

    restRow.appendChild(colDiv);
  });
});