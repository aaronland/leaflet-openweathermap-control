// version v1.0.0

L.Control.OpenWeatherMap = L.Control.extend({
    _map: null,
    _features: [],
    options: {
        position: 'topright',
	appid: '',
	units: 'standard',
	markerFunc: function(feature){

	    var props = feature.properties;

	    var name = props.name;
	    var temp = props.main.temp;
	    var wind = props.wind;
	    
	    var ts = props.dt;
	    var dt = new Date(ts * 1000);

	    var el = document.createElement("div");

	    el.appendChild(document.createTextNode(name + ", " + temp + " degrees"));

	    el.appendChild(document.createElement("br"));
	    
	    el.appendChild(document.createTextNode("Winds at " + wind.speed));

	    if (wind.gust){
 		el.appendChild(document.createTextNode(" (with gusts up " + wind.gust + ")"));
	    }

	    el.appendChild(document.createTextNode(" @" + wind.deg));
	    el.appendChild(document.createElement("br"));	    

	    el.appendChild(document.createTextNode(dt.toLocaleString()));
	    return el;
	},
    },

    onAdd: function(map) {

	this._map = map;

	var self = this;
	
	var container = L.DomUtil.create('div','leaflet-bar leaflet-control leaflet-openweathermap-container');

	var spinner_wrapper = L.DomUtil.create('div', 'leaflet-bar-part leaflet-openweathermap-spinner', container);
	spinner_wrapper.setAttribute("id", "spinner");

	var spinner = L.DomUtil.create('div', 'leaflet-bar-part spinner', spinner_wrapper);
	
        var trigger = L.DomUtil.create('a', 'leaflet-control-image-button leaflet-bar-part leaflet-openweathermap-trigger', container);
        trigger.href = '#';
	
	// trigger.innerText = "[?]";

	map.on("movestart", function(){
	    trigger.style.display = "inline-block";
	});
	    
	map.on("moveend", function(){

	});
	
	var on_trigger = function(){

	    trigger.style.display = "none";
	    spinner_wrapper.style.display = "inline-block";
	    
	    var center = map.getCenter();
	    
	    var params = {
		'lat': center.lat,
		'lon': center.lng,
		'appid': self.options.appid,
		'units': self.options.units,
	    };

	    openweathermap.api.call("weather", params)
			  .then(rsp => {

			      spinner_wrapper.style.display = "none";
			      
			      geom = {
				  "type": "Point",
				  "coordinates": [ center.lng, center.lat ],
			      };
			      
			      var f = {
				  "type": "Feature",
				  "properties": rsp,
				  "geometry": geom,
			      }

			      var popup;
			      
			      function onEachFeature(feature, layer) {
				  var el = self.options.markerFunc(feature);
				  popup = layer.bindPopup(el);
			      }

			      var geojsonMarkerOptions = {
				  radius: 8,
				  fillColor: "#ff7800",
				  color: "#000",
				  weight: 1,
				  opacity: 1,
				  fillOpacity: 0.8
			      };
			      
			      var layer_args = {
				  onEachFeature: onEachFeature,
				  pointToLayer: function (feature, latlng) {
				      return L.circleMarker(latlng, geojsonMarkerOptions);
				  }
			      };
			      
			      var layer = L.geoJSON(f, layer_args);

			      layer.addTo(map);
			      popup.openPopup();
			  })
			  .catch((err) => {
			      spinner_wrapper.style.display = "none";
			      console.log("SAD", err);
			  });
	    
	};

	L.DomEvent.on(trigger, 'click', on_trigger, this);
	
	// This is necessary in order to copy/paste
	L.DomEvent.disableClickPropagation(container);
	
	return container;
    }

});    
