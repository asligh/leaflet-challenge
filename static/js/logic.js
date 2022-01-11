async function main() 
{
    const featureCollection = [];

    // Creating the map object
    const map = L.map("map", {
      center: [40.7, -73.95],
      zoom: 5
    });
  
    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Store the API query variables.
    // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
    // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
    //https://geospatialresponse.wordpress.com/2015/07/26/leaflet-geojson-pointtolayer/

    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

    const response =  await fetch(url);
    const data = await response.json();
    
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

        if(earthquake_depth < -10)
            result = lime_green;
        else if(earthquake_depth >= -10 && earthquake_depth < 30)
            result = light_green_yellow;
        else if(earthquake_depth >= 30 && earthquake_depth < 50)
            result = light_orange;
        else if(earthquake_depth >= 50 && earthquake_depth < 70)
            result = orange;
        else if(earthquake_depth >= 70 && earthquake_depth < 90)
            result = light_brown;  
        else
            result = light_red;  

        return result;
    }

    function buildGeoJsonByFeature(longitude,
                                   latitude,
                                   magnitude,
                                   depth,
                                   location,
                                   idx)
    {
        let geoJson          = {};
        let feature_dict     = {};
        let properties_dict  = {};
        let geometry_dict    = {};
        let coordinates_dict = {};

        feature_dict['type'] = "Feature";
        feature_dict['id']   = idx;

        coordinates_dict["type"] = "Point";
        coordinates_dict["coordinates"] = [longitude,latitude];

        //geometry_dict["geometry"] = coordinates_dict;

        properties_dict["Magnitude"] = magnitude;
        properties_dict["Location"]  = location;   
        properties_dict["Depth"]     = depth;    
     
        feature_dict['properties'] = properties_dict;
        feature_dict['geometry']   = coordinates_dict;     

        geoJson['type'] = "FeatureCollection";
        geoJson['features'] = [feature_dict];

        console.log(JSON.stringify(geoJson));
        //break;

        return geoJson;
    }

    for (let idx = 0; idx < data.features.length; idx++)
    {
        let feature     = data.features[idx];
        let coordinates = feature.geometry.coordinates;
        let magnitude   = feature.properties.mag;
        let location    = feature.properties.place;
        
        let longitude = coordinates[0];
        let latitude  = coordinates[1];
        let depth     = coordinates[2];

        let geoJson = buildGeoJsonByFeature(longitude,
                                            latitude,
                                            magnitude,
                                            depth,
                                            location,
                                            idx);

        let geojsonLayer = L.geoJson(geoJson, {
                                                    style: function(feature) 
                                                    {
                                                        return 
                                                        {
                                                            color: "green"
                                                        };
                                                    },
                                                    pointToLayer: function(feature, latlng) 
                                                    {
                                                        return new L.CircleMarker(latlng, {
                                                                                            radius: 10, 
                                                                                            fillOpacity: 0.85
                                                                                          });
                                                    },
                                                    onEachFeature: function (feature, layer) 
                                                    {
                                                        layer.bindPopup(feature.properties.Magnitude);
                                                    }
                                            });
        map.addLayer(geojsonLayer);


    }
}
main();