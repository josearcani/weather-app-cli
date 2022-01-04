const fs = require('fs');
const axios = require('axios');

class Busquedas {

  historial = [];
  dbPath = './db/database.json';

  constructor () {
    // TODO leer DB si existe
    this.leerDB()
  }

  get paramsMapbox () {
    return {
      'access_token': process.env.MAPBOX_KEY,
      'limit': 5,
      'language': 'es'
    }
  }

  get parasmWeather () {
    return {
      'appid': process.env.OPENWEATHER_KEY,
      'lang': 'es',
      'units': 'metric',
    }
  }

  get historialCapitalizado () {
    // capitalizar 
    return this.historial.map((lugar) => {
      return lugar.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))); 
      /**
       * \w => un caracter alfanumerico o guion bajo
       * \S => Cualquier caracter, excepto espacios en blanco
       * \* => cero o más con la maxima extensión posible
       */
    })
  }


  async ciudadades (lugar = '') {
    // petición http
    try {

      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox
      });

      const { data } = await instance.get();
      // console.log(data.features)
      return data.features.map((ciudad) => ({
        id: ciudad.id,
        nombre: ciudad.place_name,
        longitud: ciudad.center[0], 
        latitud: ciudad.center[1], 
      }))
      
    } catch (err) {
      console.log(err)
    }
  }

  async climaLugar (lat, lon) {
    try {
      const instace = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.parasmWeather, lat, lon }
      });

      const { data } = await instace.get();

      const { weather, main } = data;
      // console.log(data);
      return {
        desc: weather[0].description,
        temp: main.temp,
        max: main.temp_max,
        min: main.temp_min,
      }
    } catch (error) {
      console.log(error)
    }
  }

  agregarHistorial (lugar = '') {
    // TODO: prevenir dulicadors

    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0,5);
    
    this.historial.unshift(lugar.toLocaleLowerCase());
    // guardar a DB

    this.guardarDB();

  }

  guardarDB () {

    const payload = {
      historial: this.historial
    }

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));

  }

  leerDB () {

    if (!fs.existsSync(this.dbPath)) return; // i no existe DB, salimos del método

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(info);
    this.historial = data.historial

  }

}

module.exports = Busquedas;