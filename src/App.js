import './App.css';
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import React, { useRef, useState, useEffect } from "react"
import { OSM } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
function App() {
  const mapRef = useRef();
  const [map, setMap] = useState()
  const typeSelect = "Polygon";
  let draw, snap;

  const raster = new TileLayer({
    source: new OSM(),
  });

  const kaynak = new VectorSource();

  const vector = new VectorLayer({
    source: kaynak,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  });

  useEffect(() => {
    // create map
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        // USGS Topo
        new TileLayer({
          source: new XYZ({
            url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          })
        }),
        raster,
        vector
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [100, 100],
        zoom: 6
      })
    })
    // save map and vector layer references to state
    setMap(initialMap)
  }, [])

  const modify = new Modify({ source: kaynak });

  const addInteractions = () => {
    draw = new Draw({
      source: kaynak,
      type: typeSelect,
    });
    map.addInteraction(draw);
    snap = new Snap({ source: kaynak });
    map.addInteraction(snap);
    console.log(map)
  }

  const change = () => {
    map.addInteraction(modify)
    addInteractions()
  }

  return (
    <div>
      <div ref={mapRef} id="map" className="map" ></div>
      <form>
        <label>Geometry type &nbsp;</label>
        <select>
          <option value="Polygon">Polygon</option>
        </select>
      </form>
      <button onClick={() => change()}>Button</button>
    </div>
  );
}

export default App;
