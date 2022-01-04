require('dotenv').config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {

  let opt = '';

  const busquedas = new Busquedas();

  do {
    opt = await inquirerMenu()

    switch (opt) {
      case 1:
        const termino = await leerInput('Ciudad:');
        // buscar lugares
        const lugares = await busquedas.ciudadades(termino);
        // selescionar un lugar
        const id = await listarLugares(lugares);

        if (id === 0) continue; // salimos?

        // de esta forma tenemos un arreglo conun objeto
        const { nombre, latitud, longitud } = lugares.find((ciudad) => ciudad.id === id);
        // const [ ciudadElegida ] = lugares.filter((ciudad) => (ciudad.id === id) ? true : false )
        //de esta manera recueramos solo el objeto
        
        // agregamos al historial
        busquedas.agregarHistorial(nombre);

        // clima del lugat
        const clima = await busquedas.climaLugar(latitud, longitud);
        
        // mostrar resultados

        console.log('\nInformación de la ciudad\n'.green)
        console.log('Ciudad:', nombre.green)
        console.log('Lat:', latitud)
        console.log('Lng:', longitud)
        console.log('Temperatura:', clima.temp)
        console.log('Mínima:', clima.min)
        console.log('Máxima:', clima.max)
        console.log('Como está el clima:', clima.desc.green)

        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
        // busquedas.historial.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;

    }

    // console.log({ opt })
    if (opt !==0) await pausa()

  } while (opt !== 0);
  
}

main();