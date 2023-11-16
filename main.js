const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require('axios');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
    });
    win.webContents.openDevTools();
    win.removeMenu();
    win.loadFile("index.html");
};

app.whenReady().then(() => {
    createWindow();
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('download-file', async (event, url) => {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = path.join(__dirname, 'uploads', 'downloaded_image.jpg');
            event.sender.send('file-downloaded', filePath)
            fs.writeFileSync(filePath, Buffer.from(response.data));
        } catch (err) {
            console.log('Error');
        }
    });
});
