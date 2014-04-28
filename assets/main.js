$(function() {
  var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1ggb9SdKIIEsxzQUfu1k0GxTi42OJ-YSuMUk9CMF7Y0g/pubhtml';
  var stateDemos = {};

  function getDemographics() {
    Tabletop.init( { key: public_spreadsheet_url,
                     callback: setDemographics,
                     simpleSheet: true } )
  }

  function setDemographics(data, tabletop) {
    data.forEach(function(state) {
      stateDemos[state['location']] = state;
    });
    suppress('elderly');
  }

  var keyToDemos = {
    'elderly': ['disabled', 'elderly']
  };

  function suppress(key) {
    var suppressed = 0;

    keyToDemos[key].forEach(function(demo) {
      suppressed += parseInt(stateDemos['United States'][demo].replace(/,/g, ''));
    });
    console.log('suppressed: ' + suppressed);
  }

  getDemographics();

  // Based on the Leaflet example from http://leafletjs.com/examples/choropleth.html
  var map = L.mapbox.map('map', 'examples.map-vyofok3q').setView([37.8, -96], 4);

  var legend = L.mapbox.legendControl().addLegend(getLegendHTML()).addTo(map);

  var popup = new L.Popup({ autoPan: false });

  // statesData comes from the 'us-states.js' script included above
  var statesLayer = L.geoJson(statesData,  {
      style: getStyle,
      onEachFeature: onEachFeature
  }).addTo(map);

  function getStyle(feature) {
      return {
          weight: 2,
          opacity: 0.1,
          color: 'black',
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties.density)
      };
  }

  // get color depending on population density value
  function getColor(d) {
      return d > 1000 ? '#8c2d04' :
          d > 500  ? '#cc4c02' :
          d > 200  ? '#ec7014' :
          d > 100  ? '#fe9929' :
          d > 50   ? '#fec44f' :
          d > 20   ? '#fee391' :
          d > 10   ? '#fff7bc' :
          '#ffffe5';
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mousemove: mousemove,
          mouseout: mouseout,
          click: zoomToFeature
      });
  }

  var closeTooltip;

  function mousemove(e) {
      var layer = e.target;

      popup.setLatLng(e.latlng);

      console.log(stateDemos[layer.feature.properties.name]);

      popup.setContent('<h2>' + layer.feature.properties.name + '</h2>' +
          stateDemos[layer.feature.properties.name]['disabled'] + ' disabled people');

      if (!popup._map) popup.openOn(map);
      window.clearTimeout(closeTooltip);

      // highlight feature
      layer.setStyle({
          weight: 3,
          opacity: 0.3,
          fillOpacity: 0.9
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
  }

  function mouseout(e) {
      statesLayer.resetStyle(e.target);
      closeTooltip = window.setTimeout(function() {
          map.closePopup();
      }, 100);
  }

  function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
  }

  function getLegendHTML() {
      var grades = [0, 10, 20, 50, 100, 200, 500, 1000],
          labels = [],
          from, to;

      for (var i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];

          labels.push(
              '<i style="background:' + getColor(from + 1) + '"></i> ' +
              from + (to ? '&ndash;' + to : '+'));
      }

      return '<span>People per square mile</span><br>' + labels.join('<br>');
  }
});
