const { ipcRenderer } = require('electron');

async function fetch_posts() {
    try {
        const response = await fetch('https://api.vk.com/method/wall.get?access_token=c66439fcc66439fcc66439fc47c6106bb5cc664c66439fc99e40d1fa44fa4df1d7d1411&owner_id=-148503450&offset=0&count=100&v=5.154', {
            method: 'GET'
        });
        const data = await response.json();
        const items = data.response.items;

        const all_images = extract_images(items);
        display_images(all_images);
    } catch (err) {
        console.log(err);
    } finally {
        return;
    }
}

function extract_images(data) {
    const all_photos = [];
    for (var item of data) {
        if (!!item.attachments && item.attachments.some(e => e.type === 'photo')) {
            const attachments = item.attachments;
            for (var attachment of attachments) {
                if (!!attachment.photo?.sizes) {
                    const largest_photo = attachment.photo.sizes.sort((a, b) => b.height - a.height)[0];
                    const url = largest_photo.url;
                    const size_w = largest_photo.width;
                    const size_h = largest_photo.height;
                    all_photos.push({ url, size_h, size_w });
                }
            }
        }
    }
    return all_photos;
}

function display_images(images) {
    const table = document.getElementById('image_table');
    for (var i of images) {
        table.innerHTML += make_img_str(i.url, i.size_w, i.size_h, 0.5);
    }
}

function handle_download(){
    const btns = document.querySelectorAll('#download_btn');
    btns.forEach(btn => btn.addEventListener('click', (e) => {
        console.log('test');
        const url = e.target.dataset.url;
        ipcRenderer.send('file-downloaded', url);
    }));

    ipcRenderer.on('file-download-response', (event, response) => {
        console.log(response); // Log the response from the main process
        // You can update the UI or perform additional actions here
    });
}

function make_img_str(src, width, height, scale = 1) {
    return (`
    <div class="flex flex-col gap-1 items-end">
    <img src="${src}" width="${width * 0.2}" height="${height * 0.2}" class="w-[${width * scale}] h-[${height * scale}]"/>
    <button class="px-3 py-1 bg-green-400 shadow-md text-white font-semibold text-xl rounded-lg" id="download_btn" onclick="handle_download()" data-url="${src}">Download</button>
    </div>`);
}

