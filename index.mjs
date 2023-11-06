import cheerio from 'cheerio';
import fs from 'fs/promises';
import cloudscraper from 'cloudscraper';

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';

async function kaynaktanListeye(kaynakKod) {
  const $ = cheerio.load(kaynakKod);
  const resimler = [];
  $('div.view-area img').each((index, element) => {
    resimler.push($(element).attr('src'));
  });
  return resimler;
}

async function a101Brosurler() {
  const domain = 'https://www.a101.com.tr';
  const brosurler = {};

  try {
    const urls = [
      `${domain}/aldin-aldin-bu-hafta-brosuru`,
      `${domain}/aldin-aldin-gelecek-hafta-brosuru`,
      `${domain}/afisler-haftanin-yildizlari`,
      `${domain}/buyuk-oldugu-icin-ucuz-afisler`,
      `${domain}/afisler-hadi`,
    ];

    for (const url of urls) {
      try {
        const response = await cloudscraper.get(url, {
          headers: {
            'User-Agent': userAgent,
          },
        });

        if (response.statusCode !== 200) {
          console.log(await response.body);
          brosurler[url] = [];
        } else {
          const kaynakKod = response.body;
          brosurler[url] = await kaynaktanListeye(kaynakKod);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (!Object.values(brosurler).some((list) => list.length > 0)) {
      throw new Error('Bir şeyler ters gitti.');
    }

    await fs.writeFile('A101.json', JSON.stringify(brosurler, null, 2), 'utf-8');

    return brosurler;
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await a101Brosurler();
})();
