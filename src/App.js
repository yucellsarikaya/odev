import './App.css';
import 'ol/ol.css';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import WKT from 'ol/format/WKT';
import React, { useRef, useState, useEffect } from "react"
import { OSM } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import Modal from 'react-modal';
import { GrClose } from 'react-icons/gr';
import { set } from 'ol/transform';
import service from './service';

function App() {
  const mapRef = useRef();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [btnShow, setBtnShow] = useState(true)
  const [map, setMap] = useState()
  const [raster, setRaster] = useState(new TileLayer({ source: new OSM(), }))
  const [kaynak, setKaynak] = useState(new VectorSource())
  const [modify, setModify] = useState(new Modify({ source: kaynak }))
  const [format, setFormat] = useState(new WKT())
  const [city, setCity] = useState()
  const [district, setDistrict] = useState()
  const [neighborhood, setNeighborhood] = useState()
  const [parselList, setParselLists] = useState()
  let [wkt, setWkt] = useState("")
  let typeSelect = "Polygon";
  let draw, snap;
  var location;
  var feature

  const vector = new VectorLayer({
    source: kaynak,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.4)',
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

  const addInteractions = () => {
    draw = new Draw({
      source: kaynak,
      type: typeSelect,
    });
    map.addInteraction(draw);
    snap = new Snap({ source: kaynak });
    map.addInteraction(snap);
  }

  const change = () => {
    //map.getInteractions().forEach(x => x.setActive(true));
    map.addInteraction(modify)
    addInteractions()
  }

  useEffect(() => {
    // let features = vector.getSource().getFeatures()
    // features.forEach(function (feature) {
    //   console.log(feature.getGeometry().getCoordinates());
    // });
    //console.log(vector.getSource().addFeature())
    kaynak.on('addfeature', function (evt) { //kaynak dinleniyor çizim bittiğin de konum bilgilerini getirecek
      feature = evt.feature;
      location = feature.getGeometry().getCoordinates()
      var x = format.writeFeature(feature);
      setWkt(wkt = x)
      setIsOpen(!modalIsOpen)
    });
  }, [])


  const haritaGetir = () => {
    setBtnShow(false)
    // create map
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        raster,
        vector
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [1171767.26555912, -106200.91208823415],
        zoom: 0
      })
    })
    // save map and vector layer references to state
    setMap(initialMap)
    list()
  }

  const toggleModal = () => {
    var a = kaynak.getFeatures(); //tüm features getirir
    var b = a[a.length - 1]; //son features getirir
    kaynak.removeFeature(b); // son featuresu siler
    setIsOpen(!modalIsOpen)
  }

  const save = () => {
    let parsel = { parselIl: city, parselIlce: district, pareselMahalle: neighborhood, wktString: wkt }
    service.create(parsel).then(() => console.log("başarılı")).catch(() => console.log("başarısız"))
    setIsOpen(!modalIsOpen)
  }

  useEffect(() => {
    service.liste().then(result => { setParselLists(result.data) })
  })

  const list = () => {
    service.liste().then(result => { setParselLists(result.data) })
    parselList.forEach(element => {
      const featuree = format.readFeature(element.wktString, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857',
      });
      featuree.set('parselId' , element.parselId)
      kaynak.addFeature(featuree)
    });
    setIsOpen(false)
  }
  const edit = () => {
    map.getInteractions().forEach(x => x.setActive(false)); //Interactions özelliğini kapatır
    map.on("click", function (e) {
      map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        console.log(feature)
      })
    })
  }
  return (
    <div>
      {btnShow ? <button onClick={() => haritaGetir()}>Haritayı Getir</button> : location}
      <div ref={mapRef} id="map" className="map" ></div>
      <label>Geometry type &nbsp;</label>
      <button onClick={() => change()}>Polygon</button>
      <button>Point(not)</button>
      <button>LineString(not)</button>
      <button onClick={() => edit()}>Yapı Edit</button>
      <Modal
        isOpen={modalIsOpen} //açık olup olmadığunu konrtol eder
        onRequestClose={toggleModal}
        className="about-modal"
        overlayClassName="about-modal-overlay"
        ariaHideApp={false}
      >
        <button className="modal-close-btn" onClick={toggleModal}> <GrClose /></button>
        <form>
          <input
            placeholder='Şehir Giriniz'
            onChange={e => setCity(e.target.value)}
          />
          <br />
          <input
            placeholder='İlçe Giriniz'
            onChange={e => setDistrict(e.target.value)}
          />
          <br />
          <input
            placeholder='Mahalle Giriniz'
            onChange={e => setNeighborhood(e.target.value)}
          />
          <br />
          <button onClick={() => save()}>Polygon u kaydet</button>
        </form>
      </Modal>
    </div>
  );
}

export default App;