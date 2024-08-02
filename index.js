const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.a101.com.tr';
const pages = [
  { url: '/aldin-aldin-bu-hafta-brosuru', key: 'Bu Hafta' },
  { url: '/aldin-aldin-gelecek-hafta-brosuru', key: 'Gelecek Hafta' },
  { url: '/afisler-haftanin-yildizlari', key: 'Haftanın Yıldızları' },
  { url: '/buyuk-oldugu-icin-ucuz-afisler', key: 'Büyük olduğu için UCUZ' }
];

async function getSliderImages() {
  try {
    const result = {};

    for (const page of pages) {
      const url = baseUrl + page.url;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      result[page.key] = [];

      $('#img-mapper img').each((index, element) => {
        const src = $(element).attr('src');
        if (src && src.includes('cdn2.a101.com.tr/dbmk89vnr/CALL/Image/get')) {
          result[page.key].push(src);
        }
      });
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Hata oluştu:', error);
    return JSON.stringify({ error: 'Veriler alınamadı' });
  }
}

getSliderImages().then(json => {
  fs.writeFile('A101.json', json, (err) => {
    if (err) {
      console.error('Dosya yazma hatası:', err);
    } else {
      console.log('Veriler başarıyla A101.json dosyasına kaydedildi.');
    }
  });
});
