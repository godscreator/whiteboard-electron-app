import "./file_menu_styles.css";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/Navdropdown'
import Nav from 'react-bootstrap/Nav'
import Container from "react-bootstrap/Container"
import "bootstrap/dist/css/bootstrap.min.css";
var JSZip = require("jszip");
var JSZipUtils = require("jszip-utils");


const Topbar = forwardRef((props, ref) => {
    const [filename, setFilename] = useState("");
    const [folderpath, setfolderpath] = useState("");
    const [urls, setUrls] = useState([]);


    const new_file = () => {
        props.clear();
        urls.forEach((url, i) => {
            URL.revokeObjectURL(url);
        });
        setUrls([]);
        setFilename("");
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
                                    zip.folder("images").forEach(function (filepath, file) {
                                        var uri = null;
                                        var fname = filepath;
                                        zip.folder("images").file(filepath).async("blob").then(function (blob) {
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

    const open_image = () => {
        window.electron.open_dialog({
            properties: ['openFile'],
            filters: [
                { name: "Image", extensions: ['jpg', 'png', 'jpeg'] },
            ]
        },
            result => {
                var filepath = result[0];
                window.electron.read_file(filepath, null,
                    result => {
                        var uri = null;
                        var fname = null;
                        if (filepath.endsWith(".png")) {
                            uri = URL.createObjectURL(
                                new Blob([result.buffer], { type: 'image/png' }));
                            fname = uri.split('/').pop().split('#')[0].split('?')[0] + ".png";

                        } else if (filepath.endsWith(".jpg")) {
                            uri = URL.createObjectURL(
                                new Blob([result.buffer], { type: 'image/jpg' }));
                            fname = uri.split('/').pop().split('#')[0].split('?')[0] + ".jpg";
                        }
                        else if (filepath.endsWith(".jpeg")) {
                            uri = URL.createObjectURL(
                                new Blob([result.buffer], { type: 'image/jpeg' }));
                            fname = uri.split('/').pop().split('#')[0].split('?')[0] + ".jpeg";
                        }
                        if (uri !== null) {
                            props.add_url(fname, uri);
                            props.insert_image(fname, uri);
                            setUrls(urls.concat([uri]));
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
        const { elements, urls } = props.get_data();
        zip.file("elements.json", JSON.stringify(elements));

        var images = zip.folder("images");
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
                defaultPath: "untitled"
            },
                async (filepath) => {
                    setFilename(window.electron.path_basename(filepath));
                    setfolderpath(window.electron.path_dirname(filepath));
                    save(filepath);
                },
                err => console.log(err)
            );
        } else {
            save(window.electron.path_join(folderpath,filename));
        }
    }


    const export_png = async () => {
        var img_url = await props.get_image_url();
        if (img_url !== "") {
            window.electron.download(img_url, { filename: "" });
        }
    }

    useImperativeHandle(ref, () => ({
        "save": () => save_file(),
        "open": () => open_file(),
        "new": () => new_file()
    }));

    return (
        <div className="top-bar">
            <Navbar expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href=".">White Board</Navbar.Brand>
                    <Navbar.Text href=".">
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="file name"
                            style={{resize:"none",outline:"none",height:"100%"}}
                        />
                    </Navbar.Text>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="File" id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={() => new_file()}>New</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => open_file()}>Open</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => save_file()}>Save</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => export_png()}>Export PNG</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#close">Close</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Edit" id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={() => open_image()}>Insert Image</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
});

export default Topbar;