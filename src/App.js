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
import service from './service';
import { Button, Image, Form, Modal } from 'semantic-ui-react'

function App() {
  const mapRef = useRef();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenFeature, setIsOpenFeature] = useState(false);
  const [btnShow, setBtnShow] = useState(true)
  const [map, setMap] = useState()
  const [raster, setRaster] = useState(new TileLayer({ source: new OSM(), }))
  const [kaynak, setKaynak] = useState(new VectorSource())
  const [modify, setModify] = useState(new Modify({ source: kaynak }))
  const [format, setFormat] = useState(new WKT())
  const [parselId, setParselId] = useState()
  const [city, setCity] = useState()
  const [district, setDistrict] = useState()
  const [neighborhood, setNeighborhood] = useState()
  const [wktString, setWktString] = useState()
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

  useEffect(() => {
    service.liste().then(result => { setParselLists(result.data) })
  })

  const change = () => {
    //map.getInteractions().forEach(x => x.setActive(true));
    map.addInteraction(modify)
    addInteractions()
    kaynak.on('addfeature', function (evt) { //kaynak dinleniyor çizim bittiğin de konum bilgilerini getirecek
      feature = evt.feature;
      location = feature.getGeometry().getCoordinates()
      var x = format.writeFeature(feature);
      setWkt(wkt = x)
      setIsOpen(!modalIsOpen)
    });
    list()
  }

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
    setIsOpen(!toggleModal)
  }

  const toggleModalFeature = () => {
    setIsOpenFeature(!modalIsOpenFeature)
  }

  const save = () => {
    let parsel = { parselIl: city, parselIlce: district, pareselMahalle: neighborhood, wktString: wkt }
    service.create(parsel).then(() => console.log("başarılı")).catch(() => console.log("başarısız"))
    setIsOpen(false)
    service.liste().then(result => { setParselLists(result.data) })
  }

  const list = () => {
    service.liste().then(result => { setParselLists(result.data) })
    parselList.forEach(element => {
      const featuree = format.readFeature(element.wktString, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857',
      });
      featuree.set('parselId', element.parselId)
      featuree.set('parselIl', element.parselIl)
      featuree.set('parselIlce', element.parselIlce)
      featuree.set('pareselMahalle', element.pareselMahalle)
      featuree.set('wktString', element.wktString)
      kaynak.addFeature(featuree)
    });
  }

  const edit = () => {
    list()
    map.getInteractions().forEach(x => x.setActive(false)); //Interactions özelliğini kapatır
    map.on("dblclick", function (e) {
      map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        setParselId(feature.values_.parselId)
        setCity(feature.values_.parselIl)
        setDistrict(feature.values_.parselIlce)
        setNeighborhood(feature.values_.pareselMahalle)
        setWktString(feature.values_.wktString)
        setIsOpenFeature(!modalIsOpenFeature)
      })
    })
  }

  const deleteParsel = (e) => {
    e.preventDefault(e);
    service.delete(parselId).then(() => console.log("silme başarılı")).catch(() => console.log("silme başarısız"))
    kaynak.clear()
    setIsOpenFeature(!modalIsOpenFeature)
    service.liste().then(result => { setParselLists(result.data) })
    list()
  }

  const updateParsel = (e) => {
    e.preventDefault();
    let parsel = { parselId: parselId, parselIl: city, parselIlce: district, pareselMahalle: neighborhood, wktString: wktString }
    service.update(parsel).then(() => console.log("güncelleme başarılı")).catch(() => console.log("güncelleme başarısız"))
    kaynak.clear()
    setIsOpenFeature(!modalIsOpenFeature)
    service.liste().then(result => { setParselLists(result.data) })
    list()
  }

  return (
    <div>
      {btnShow ? <button onClick={() => haritaGetir()}>Haritayı Getir</button> : location}
      <div ref={mapRef} id="map" className="map" ></div>
      <label>Geometry type &nbsp;</label>
      <Button basic color='red' onClick={() => change()}>Polygon</Button>
      <Button basic color='orange'>Point(not)</Button>
      <Button basic color='purple'>LineString(not)</Button>
      <Button basic color='yellow' onClick={() => edit()}>Yapı Edit</Button>

      <Modal
        size={"tiny"}
        open={modalIsOpen}
      >
        <Modal.Header>BELSİS</Modal.Header>
        <Modal.Content image>
          <Image size='medium' src='https://files.ulutek.com.tr/upload/file_manager/2020/9/UlutekFirmalar/belsis_logo_568ebe7b703e4e1f837a7fa11aeda979.jpg' wrapped />
          <Modal.Description>
            <p>Belsis işe dokanan çözümler?</p>
          </Modal.Description>
        </Modal.Content>
        <Form>
          <Form.Field>
            <input
              placeholder='Şehir Giriniz'
              onChange={e => setCity(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <input
              placeholder='İlçe Giriniz'
              onChange={e => setDistrict(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <input
              placeholder='Mahalle Giriniz'
              onChange={e => setNeighborhood(e.target.value)}
            />
          </Form.Field>
        </Form>
        <Modal.Actions>
          <Button primary onClick={() => save()}>Polygon u kaydet</Button>
          <Button negative onClick={() => toggleModal()}> Kapat</Button>
        </Modal.Actions>
      </Modal>


      <Modal
        onClose={toggleModalFeature}
        size={"tiny"}
        onOpen={() => toggleModalFeature}
        open={modalIsOpenFeature}
      >
        <Button className="modal-close-btn" onClick={toggleModalFeature}></Button>
        <Form>
          <Form.Field>
            <input
              placeholder='Şehir Giriniz'
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <input
              placeholder='İlçe Giriniz'
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <input
              placeholder='Mahalle Giriniz'
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
            />
          </Form.Field>
          <Modal.Actions>
            <Button onClick={(e) => updateParsel(e)} primary>Parseli güncelle</Button>
            <Button onClick={(e) => deleteParsel(e)} primary color='red'>Parseli sil</Button>
          </Modal.Actions>
        </Form>
      </Modal>
    </div>
  );
}

export default App;