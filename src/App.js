import './App.css';
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import React, { useRef, useState, useEffect } from "react"

function App() {
  const mapRef = useRef();
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [selectedCoord, setSelectedCoord] = useState()

  useEffect(() => {
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })

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
        initalFeaturesLayer
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [42625750.8868,5515164.4724],
        zoom: 6
      }),
      controls: []
    })
    // save map and vector layer references to state
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)
  }, [])

  return (
    <div>
      <div ref={mapRef} id="map" className="map" ></div>
    </div>
  );
}

export default App;
