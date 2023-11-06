const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

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
        const yanitHafta = await fetch(`${domain}/aldin-aldin-bu-hafta-brosuru`);
        if (yanitHafta.status !== 200) {
            console.log(await yanitHafta.text());
            brosurler["Bu Hafta"] = [];
        } else {
            const kaynakKodHafta = await yanitHafta.text();
            brosurler["Bu Hafta"] = await kaynaktanListeye(kaynakKodHafta);
        }

        const yanitGelecekHafta = await fetch(`${domain}/aldin-aldin-gelecek-hafta-brosuru`);
        if (yanitGelecekHafta.status !== 200) {
            console.log(await yanitGelecekHafta.text());
            brosurler["Gelecek Hafta"] = [];
        } else {
            const kaynakKodGelecekHafta = await yanitGelecekHafta.text();
            brosurler["Gelecek Hafta"] = await kaynaktanListeye(kaynakKodGelecekHafta);
        }

        const yanitYildizlari = await fetch(`${domain}/afisler-haftanin-yildizlari`);
        if (yanitYildizlari.status !== 200) {
            console.log(await yanitYildizlari.text());
            brosurler["Haftanın Yıldızları"] = [];
        } else {
            const kaynakKodYildizlari = await yanitYildizlari.text();
            brosurler["Haftanın Yıldızları"] = await kaynaktanListeye(kaynakKodYildizlari);
        }

        const yanitUcuzAfisler = await fetch(`${domain}/buyuk-oldugu-icin-ucuz-afisler`);
        if (yanitUcuzAfisler.status !== 200) {
            console.log(await yanitUcuzAfisler.text());
            brosurler["Büyük olduğu için UCUZ"] = [];
        } else {
            const kaynakKodUcuzAfisler = await yanitUcuzAfisler.text();
            brosurler["Büyük olduğu için UCUZ"] = await kaynaktanListeye(kaynakKodUcuzAfisler);
        }

        const yanitHadi = await fetch(`${domain}/afisler-hadi`);
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

        fs.writeFileSync("A101.json", JSON.stringify(brosurler, null, 2), 'utf-8');

        return brosurler;
    } catch (error) {
        console.error(error);
    }
}

a101Brosurler();
