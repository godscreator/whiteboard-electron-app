const new_file = () => {
    props.clear();
    urls.forEach((url, i) => {
        URL.revokeObjectURL(url);
    });
    setUrls([]);
    setFilename("untitled.wbrd");
}

const open_file = () => {
    new_file();
    window.electron.open_dialog({
        properties: ['openFile'],
        filters: [
            { name: "WhiteBoard File", extensions: ['wbrd'] },
        ]
    },
        result => {
            var filepath = result[0];
            setFilename(window.electron.path_basename(filepath));
            setfolderpath(window.electron.path_dirname(filepath));

            window.electron.read_file(filepath, null,
                result => {
                    JSZip.loadAsync(result).then(function (zip) {
                        zip.file("elements.json").async("string")
                            .then(result => {
                                props.load_elements(JSON.parse(result));
                                zip.file("pages.json").async("string").then(pages => {
                                    props.load_page_images(JSON.parse(pages));
                                })
                                zip.folder("media").forEach(function (filepath, file) {
                                    var uri = null;
                                    var fname = filepath;
                                    zip.folder("media").file(filepath).async("blob").then(function (blob) {
                                        uri = URL.createObjectURL(blob);
                                        if (uri !== null) {
                                            props.add_url(fname, uri);
                                            setUrls(urls.concat([uri]));
                                            props.refresh();
                                        }
                                    });
                                    console.log("The file is loaded.");
                                })


                            }).catch(err => console.log(err));

                    });

                },
                err => console.log(err)
            );


        },
        err => {
            console.log(err);
        }
    );
};

const open_media = () => {
    window.electron.open_dialog({
        properties: ['openFile'],
        filters: [
            { name: "Image", extensions: ['jpg', 'png', 'jpeg'] },
            { name: "Video", extensions: ['mp4'] },
            { name: "Audio", extensions: ['mp3'] },
        ]
    },
        result => {
            var filepath = result[0];
            window.electron.read_file(filepath, null,
                result => {
                    var uri = null;
                    var fname = null;
                    var type = null;
                    var ext = null;
                    if (filepath.endsWith(".png")) {
                        type = "image";
                        ext = "png";

                    } else if (filepath.endsWith(".jpg")) {
                        type = "image";
                        ext = "jpg";
                    }
                    else if (filepath.endsWith(".jpeg")) {
                        type = "image";
                        ext = "jpeg";
                    } else if (filepath.endsWith(".mp4")) {
                        type = "video";
                        ext = "mp4";
                    }
                    else if (filepath.endsWith(".mp3")) {
                        type = "audio";
                        ext = "mp3";
                    }
                    if (type !== null) {
                        uri = URL.createObjectURL(
                            new Blob([result.buffer], { type: type + "/" + ext }));
                        fname = uri.split('/').pop().split('#')[0].split('?')[0] + "." + ext;
                        props.add_url(fname, uri);
                        setUrls(urls.concat([uri]));
                        switch (type) {
                            case "image":
                                var img = new Image();
                                img.src = uri;
                                img.onload = function () {
                                    props.insert_media(fname, img.width, img.height, "image");
                                }
                                break;
                            case "video":
                                var vid = document.createElement("video");
                                vid.src = uri;
                                vid.onloadedmetadata = function () {
                                    props.insert_media(fname, vid.videoWidth, vid.videoHeight, "video");
                                }
                                break;
                            case "audio":
                                props.insert_media(fname, 5, 1, "audio");
                                break;
                            default:
                                break;
                        }



                    }
                },
                err => console.log(err)
            );


        },
        err => {
            console.log(err);
        }
    );
};

const save = async (filepath) => {
    var zip = new JSZip();
    const { elements, pages, urls } = props.get_data();
    zip.file("elements.json", JSON.stringify(elements));
    zip.file("pages.json", JSON.stringify(pages));
    var images = zip.folder("media");
    for (const fname in urls) {
        const url = urls[fname];
        try {
            var data = await JSZipUtils.getBinaryContent(url);
            console.log(fname, " added.");
            images.file(fname, data, { binary: true });
        } catch (err) {
            console.error(err);
        }
    };
    zip.generateAsync({ type: "nodebuffer" })
        .then(function (content) {
            window.electron.write_file(filepath, content,
                result => {
                    console.log("The file is saved");
                },
                err => console.log(err)
            );
        });
}

const save_file = () => {
    if (folderpath === "") {
        window.electron.save_dialog({
            filters: [
                { name: "WhiteBoard File", extensions: ['wbrd'] },
            ],
            defaultPath: filename
        },
            async (filepath) => {
                setFilename(window.electron.path_basename(filepath));
                setfolderpath(window.electron.path_dirname(filepath));
                save(filepath);
            },
            err => console.log(err)
        );
    } else {
        save(window.electron.path_join(folderpath, filename));
    }
}


const export_png = () => {
    var { url, page_no } = props.get_image_url();
    if (url !== "") {
        window.electron.download(url, { filename: filename.replace(".wbrd", "_" + (page_no + 1) + ".png"), openFolderWhenDone: true });
    }
}
const export_pdf = () => {
    var images = props.get_page_image_urls();
    window.electron.images_to_pdf(images, { filename: filename.replace(".wbrd", ".pdf"), openFolderWhenDone: true })
}
