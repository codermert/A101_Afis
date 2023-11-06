import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';

async function kaynaktanListeye(kaynakKod) {
    const $ = cheerio.load(kaynakKod);
    const resimler = [];
    $('div.view-area img').each((index, element) => {
        resimler.push($(element).attr('src'));
    });
    return resimler;
}

async function a101Brosurler() {
    const domain = "https://www.a101.com.tr";
    const brosurler = {};

    try {
        const yanitHafta = await fetch(`${domain}/aldin-aldin-bu-hafta-brosuru`, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (yanitHafta.status !== 200) {
            console.log(await yanitHafta.text());
            brosurler["Bu Hafta"] = [];
        } else {
            const kaynakKodHafta = await yanitHafta.text();
            brosurler["Bu Hafta"] = await kaynaktanListeye(kaynakKodHafta);
        }

        const yanitGelecekHafta = await fetch(`${domain}/aldin-aldin-gelecek-hafta-brosuru`, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (yanitGelecekHafta.status !== 200) {
            console.log(await yanitGelecekHafta.text());
            brosurler["Gelecek Hafta"] = [];
        } else {
            const kaynakKodGelecekHafta = await yanitGelecekHafta.text();
            brosurler["Gelecek Hafta"] = await kaynaktanListeye(kaynakKodGelecekHafta);
        }

        const yanitYildizlari = await fetch(`${domain}/afisler-haftanin-yildizlari`, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (yanitYildizlari.status !== 200) {
            console.log(await yanitYildizlari.text());
            brosurler["Haftanın Yıldızları"] = [];
        } else {
            const kaynakKodYildizlari = await yanitYildizlari.text();
            brosurler["Haftanın Yıldızları"] = await kaynaktanListeye(kaynakKodYildizlari);
        }

        const yanitUcuzAfisler = await fetch(`${domain}/buyuk-oldugu-icin-ucuz-afisler`, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (yanitUcuzAfisler.status !== 200) {
            console.log(await yanitUcuzAfisler.text());
            brosurler["Büyük olduğu için UCUZ"] = [];
        } else {
            const kaynakKodUcuzAfisler = await yanitUcuzAfisler.text();
            brosurler["Büyük olduğu için UCUZ"] = await kaynaktanListeye(kaynakKodUcuzAfisler);
        }

        const yanitHadi = await fetch(`${domain}/afisler-hadi`, {
            headers: {
                'User-Agent': userAgent,
            },
        });

        if (yanitHadi.status !== 200) {
            console.log(await yanitHadi.text());
            brosurler["Hadi"] = [];
        } else {
            const kaynakKodHadi = await yanitHadi.text();
            brosurler["Hadi"] = await kaynaktanListeye(kaynakKodHadi);
        }

        if (!Object.values(brosurler).some(list => list.length > 0)) {
            throw new Error("Bir şeyler ters gitti.");
        }

        await fs.writeFile("A101.json", JSON.stringify(brosurler, null, 2), 'utf-8');

        return brosurler;
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    await a101Brosurler();
})();
