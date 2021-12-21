import axios from 'axios'
const add = "https://localhost:44393/api/Parsel/add"

class PolygonService {
    create(polygon) {
        return axios.post(add, polygon)
    }
}

export default new PolygonService()