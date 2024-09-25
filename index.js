const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

const url = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";

async function main() {
    try {
        const response = await axios.get(url);
        const data = response.data.data;

        if (!data) {
            throw new Error('JSON does not have a "data" property at its root.');
        }

        const downloadDir = path.join(__dirname, "downloads");
        await fs.mkdir(downloadDir, { recursive: true });

        const downloadPromises = [];

        let count = 1;
        for (const subproperty of Object.values(data)) {
            if (subproperty && subproperty.dhd) {
                const imageUrl = subproperty.dhd;
                const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
                const filename = `${count}${ext}`;
                const filePath = path.join(downloadDir, filename);
                downloadPromises.push(downloadImage(imageUrl, filePath));
                count++;
            }
        }

        await Promise.all(downloadPromises);
        console.info(`All images downloaded successfully!`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function downloadImage(url, filePath) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        await fs.writeFile(filePath, response.data);
        console.info(`Saved image to ${filePath}`);
    } catch (error) {
        console.error(`Failed to download image: ${error.message}`);
    }
}

main();
