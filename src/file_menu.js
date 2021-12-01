import "./file_menu_styles.css";
import React, { useState } from "react";
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/Navdropdown'
import Nav from 'react-bootstrap/Nav'
import Container from "react-bootstrap/Container"
import "bootstrap/dist/css/bootstrap.min.css";
var JSZip = require("jszip");
var JSZipUtils = require("jszip-utils");


export default function Topbar(props) {
    const [filename, setFilename] = useState("");


    const new_file = () => {
        props.setData([]);
        for (const fname in props.urls) {
            URL.revokeObjectURL(props.urls[fname]);
        };
        props.setUrls({});
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
                setFilename(filepath);

                window.electron.read_file(filepath, null,
                    result => {
                        JSZip.loadAsync(result).then(function (zip) {
                            zip.file("elements.json").async("string")
                                .then(result => {
                                    props.setData(JSON.parse(result));
                                    zip.folder("images").forEach(function (filepath, file) {
                                        var uri = null;
                                        var fname = filepath;
                                        zip.folder("images").file(filepath).async("blob").then(function (blob) {
                                            uri = URL.createObjectURL(blob);
                                            if (uri !== null) {
                                                var urls = props.urls;
                                                urls[fname] = uri;
                                                props.setUrls(urls);
                                                console.log(fname, "image loaded");
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
                            var urls = props.urls;
                            urls[fname] = uri;
                            props.setUrls(urls);
                            props.setData(props.data.concat([{ name: "image", fname: fname, id: props.count, shapeProps: { x: 0, y: 0, width: 100, height: 100, rotation: 0 } }]))
                            props.setCount(props.count + 1);
                            console.log("image inserted");
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
        zip.file("elements.json", JSON.stringify(props.data));

        var images = zip.folder("images");
        for (const fname in props.urls) {
            const url = props.urls[fname];
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
        if (filename === "") {
            window.electron.save_dialog({
                filters: [
                    { name: "WhiteBoard File", extensions: ['wbrd'] },
                ],
                defaultPath: "untitled"
            },
                async (filepath) => {
                    setFilename(filepath);
                    save(filepath);
                },
                err => console.log(err)
            );
        } else {
            save(filename);
        }
    }


    const export_png = async () => { 
        var img_url = await props.get_image_url();
        if (img_url !== "") {
            window.electron.download(img_url, { filename: "" });
        }
    }

    return (
        <div className="top-bar">
            <Navbar expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href=".">White Board</Navbar.Brand>
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
};