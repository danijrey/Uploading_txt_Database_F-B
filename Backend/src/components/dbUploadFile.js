const fs = require('fs');


 function dbUploadFile(){
  try {
    fs.readFile(.../public/db.txt, 'utf-8', (error, data) => {

      if (error) {
        throw error;
      } else {
        console.log(data)
      }

    })
  } catch (error) {

  }
}
