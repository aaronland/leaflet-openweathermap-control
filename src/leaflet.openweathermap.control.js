// version v0.0.0

L.Control.OpenWeatherMap = L.Control.extend({
    _map: null,
    options: {
        position: 'topright',
	appid: '',
	units: 'standard',
    },

    onAdd: function(map) {

	this._map = map;

	var self = this;
	
	var container = L.DomUtil.create('div','leaflet-bar leaflet-control leaflet-openweathermap-container');

	var conditions = L.DomUtil.create('span', 'leaflet-bar-part leaflet-openweathermap-conditions', container);
	
        var trigger = L.DomUtil.create('a', 'leaflet-control-image-button leaflet-bar-part leaflet-openweathermap-trigger', container);
        trigger.href = '#';
	
	trigger.innerText = "[?]";

	map.on("movestart", function(){
	    conditions.innerText = "";
	    trigger.style.display = "inline-block";
	});
	    
	var on_trigger = function(){

	    trigger.style.display = "none";
	    
	    var center = map.getCenter();
	    
	    var params = {
		'lat': center.lat,
		'lon': center.lng,
		'appid': self.options.appid,
		'units': self.options.units,
	    };

	    openweathermap.api.call("weather", params)
			  .then(rsp => {

			      var name = rsp.name;
			      var temp = rsp.main.temp;
			      var wind = rsp.wind;

			      conditions.innerText = name + " " + temp + " " + wind.speed + " (" + wind.gust + ") @" + wind.deg; 
			  })
			  .catch((err) => {
			      console.log("SAD", err);
			  });
	    
	};

	L.DomEvent.on(trigger, 'click', on_trigger, this);
	
	// This is necessary in order to copy/paste
	L.DomEvent.disableClickPropagation(container);
	
	return container;
    }

});    
