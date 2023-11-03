const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const timesToDownload = require('./timesToDownload.js')
const downloadDirectory = 'E:/caiom/Documents/sacamisa/catalogo';

async function getImagensFromHuaze(url, modelo, time, liga){
  try {
    const responseHuaze = await axios.get(url);
    const $ = cheerio.load(responseHuaze.data);
    // Check if the response status code is 200 (OK)
    if (responseHuaze.status === 200) {
      // Load the HTML content into Cheerio
      let imageUrls = [];
      fillImageUrls($, imageUrls);
      await salvaImagens(imageUrls, time, liga, modelo, url);
    } else {
      console.error('Ocorreu um erro ao entrar no Album do Huaze');
    }
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
}

async function salvaImagens(imageUrls, time, liga, modelo, url) {
  for (let i = 0; i < imageUrls.length; i++) {
    const imageSrc = imageUrls[i];
    const imageResponse = await axios.get('https://photo.yupoo.com/kakahuaze123' + imageSrc, { responseType: 'arraybuffer', headers: { Referer: url } });
    const imageBuffer = imageResponse.data;

    // Specify the path where you want to save the image
    const dir = `${downloadDirectory}/${liga}/${time}/${modelo}`
    const imagePath = path.join(dir, `${modelo}_${i + 1}.png`);

    // Save the image to the specified path
    if(!fs.existsSync(dir)){
      fs.mkdirSync(dir, {recursive: true})
      console.log(`Diretório Criado com Sucesso '${dir}'`)
    }
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer, 'binary'));

    console.log(`Image ${i + 1} downloaded and saved to ${imagePath}`);
  }
}

function fillImageUrls($, imageUrls) {
  $('.image__imagewrap img').each(function () {
    imageUrls.push($(this).attr('data-origin-src').split('123')[1]);
  });
}
async function main() {
  for (const liga in timesToDownload) {
    for (const time in timesToDownload[liga]) {
      for (const modelo in timesToDownload[liga][time]) {
        let url = timesToDownload[liga][time][modelo];
        await getImagensFromHuaze(url, modelo, time, liga);
      }
    }
  }
}
main();

