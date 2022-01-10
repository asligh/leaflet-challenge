async function main() {

    let magnitude_factor = 3;

    // Creating the map object
    const myMap = L.map("map", {
      center: [40.7, -73.95],
      zoom: 5
    });
  
    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);
  
    // Store the API query variables.
    // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
    // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

    
    // Get the data 
    const response =  await fetch(url);
    const data = await response.json();
    
    // Create a new marker cluster group.
    const markers = L.markerClusterGroup();

    console.log(data.features.length);

    function getFillColorByGivenDepth(earthquake_depth) 
    {
        result = '';
        
        let lime_green         = "#aaff80"; //-10-10
        let light_green_yellow = "#d5ff80"; //10-30
        let light_orange       = "#ffcc66"; //30-50
        let orange             = "#ff9900"; //50-70
        let light_brown        = "#ffbf80"; //70-90
        let light_red          = "#ff9980"; //90+

        if(earthquake_depth <= 10)
            result = lime_green;
        else if(earthquake_depth >= -10 && earthquake_depth <= 30)
            result = light_green_yellow;
        else if(earthquake_depth > 30 && earthquake_depth <= 50)
            result = light_orange;
        else if(earthquake_depth > 50 && earthquake_depth <= 70)
            result = orange;
        else if(earthquake_depth > 70 && earthquake_depth <= 90)
            result = light_brown;  
        else
              result = light_red;  

        return result;
    }

    for (let i = 0; i < data.features.length; i++) 
    {
        let feature     = data.features[i];
        let coordinates = feature.geometry.coordinates;
        let magnitude   =  feature.properties.mag;
        
        let longitude = coordinates[0];
        let latitude  = coordinates[1];
        let depth     = coordinates[2];

        console.log(magnitude);

        let circle_fill_color = getFillColorByGivenDepth(depth);
        let earthquakeRadius  = magnitude_factor * magnitude;

        let coord_marker = L.circleMarker([latitude, longitude], {
                                                                    color: "black",
                                                                    fillColor: circle_fill_color,
                                                                    fillOpacity: 0.5,
                                                                    radius: earthquakeRadius * 10
                                                                });

         markers.addLayer(coord_marker);

     }
  
    // Add our marker cluster layer to the map.
    myMap.addLayer(markers);
  
  }
  
  main();
  