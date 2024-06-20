const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const timesToDownload = require('./timesToDownload.js')
const downloadDirectory = 'D:/projetos/sacamisa/catalogo';

async function getImagensFromHuaze(url, modelo, time, liga) {
  const dir = `${downloadDirectory}/${liga}/${time}/${modelo}`;
  
  // Check if the directory exists
  if (fs.existsSync(dir)) {
    console.log(`Diretório '${dir}' já existe. Pulando o download.`);
    return; // Exit the function if the directory already exists
  }
  
  try {
    const responseHuaze = await axios.get(url);
    const $ = cheerio.load(responseHuaze.data);
    
    if (responseHuaze.status === 200) {
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

    const dir = `${downloadDirectory}/${liga}/${time}/${modelo}`;
    const imagePath = path.join(dir, `${modelo}_${i + 1}.png`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Diretório Criado com Sucesso '${dir}'`);
    }

    if (!fs.existsSync(imagePath)) {
      fs.writeFileSync(imagePath, Buffer.from(imageBuffer, 'binary'));
      console.log(`Arquivo salvo com sucesso em '${imagePath}'`);
    } else {
      console.log(`Arquivo '${imagePath}' já existe. Não foi salvo.`);
    }
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
