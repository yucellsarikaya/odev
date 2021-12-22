import axios from 'axios'

const add = "https://localhost:44393/api/Parsel/add"
const list = "https://localhost:44393/api/Parsel/all"
const del = "https://localhost:44393/api/Parsel/delete/"
const update = "https://localhost:44393/api/Parsel/update"
class PolygonService {
    create(polygon) {
        return axios.post(add, polygon)
    }
    liste() {
        return axios.get(list);
    }
    delete(id) {
        return axios.delete(del + id)
    }
    update(parsel){
        return axios.post(update, parsel)
    }
}

export default new PolygonService()