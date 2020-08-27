require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const oracledb = require('oracledb');
const dbConfig = require('./src/db.js');
const fs = require('fs');


const port = 8080;

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

async function run() {
  let connection;
  try {

    connection = await oracledb.getConnection(dbConfig);

    console.log('Connection was successful!');

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();

async function Open(sql, binds, autoCommit) {
  
  let connection = await oracledb.getConnection(dbConfig);
  let result = await connection.execute(sql, binds, { autoCommit });
  connection.release();
  return result;
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname )
    }
})


function dbUploadFile(crm, name, lastname, telephone, adress ) {
 
  fs.readFile(
    'C:/Users/pante/OneDrive/Documentos/Projects/DaVinci/Prueba-Desarrollador/Backend/public/db.txt', 
    'utf-8', 
    async (error, data) => {
      if (error) {
        throw error;
      } else {
        let arrData = data.split('\n')
        let arrTitle = arrData[0].split(' ');
        let arrTable = ['nombre', 'apellido', 'teléfono',  'dirección']
        let target = []

        console.log(arrTitle)

        for (let i = 0; i < arrTable.length; i++) {
          for (let j = 0; j < arrTitle.length; j++) {
            if (arrTitle[j].toLowerCase() === arrTable[i] ) {
              target.push([i, j]);
            }
          }
        }
        
        let namePos = target[0,0];
        let lastnamePos = target[0,1];
        let telephonePos = target[0,2];
        let adressPos = target[0,3];

        for (let k = 1; k < arrData.length; k++){
          let arrMat = arrData[k].split(',')
          
          let nameSQL = null;
          if (name == 'nombre'){
            nameSQL = arrMat[namePos[1]]
          }
          
          let lastnameSQL = null;
          if (lastname == 'apellido') {
            lastnameSQL = arrMat[lastnamePos[1]]
          }

          let telephoneSQL = null;
          if (telephone == 'teléfono') {
            telephoneSQL = arrMat[telephonePos[1]]
          }
          
          let adressSQL = null;
          if (adress == 'dirección') {
            adressSQL = arrMat[adressPos[1]]
          }

          sql = "insert into campaign(first_name, last_name, telephone, adress, crm_campaign) values (:nameSQL,:lastnameSQL, :telephoneSQL, :adressSQL, :crm)";

          await Open(sql, [nameSQL, lastnameSQL, telephoneSQL, adressSQL, crm], true);

        } 
        
      }

    })
 
}
const upload = multer({ storage: storage }).single('file')

app.post('/upload', (req, res) => {

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    const { crm, name, lastname, telephone, adress } = req.body 
    dbUploadFile(crm, name, lastname, telephone, adress );
    return res.status(200).send(req.file)
    
  })

});

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);
