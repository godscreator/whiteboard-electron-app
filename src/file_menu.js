import "./file_menu_styles.css";
import React, { useState } from "react";
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/Navdropdown'
import Nav from 'react-bootstrap/Nav'
import Container from "react-bootstrap/Container"
import "bootstrap/dist/css/bootstrap.min.css";
var JSZip = require("jszip");


export default function Topbar(props) {
    const [filename, setFilename] = useState("");


    const new_file = () => {
        props.setData([]);
        setFilename("");
    }
    const open_file = () => {
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
                                    console.log("The file is loaded.");
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

    const save_file = () => {
        if (filename === "") {
            window.electron.save_dialog({
                filters: [
                    { name: "WhiteBoard File", extensions: ['wbrd'] },
                ],
                defaultPath: "untitled"
            },
                filepath => {
                    setFilename(filepath);

                    var zip = new JSZip();
                    zip.file("elements.json", JSON.stringify(props.data));
                    zip.generateAsync({ type: "nodebuffer" })
                        .then(function (content) {
                            window.electron.write_file(filepath, content,
                                result => {
                                    console.log("The file is saved");
                                },
                                err => console.log(err)
                            );
                        });


                },
                err => console.log(err)
            );
        } else {

            var zip = new JSZip();
            zip.file("elements.json", JSON.stringify(props.data));
            zip.generateAsync({ type: "nodebuffer" })
                .then(function (content) {
                    window.electron.write_file(filename, content,
                        result => {
                            console.log("The file is saved");
                        },
                        err => console.log(err)
                    );
                });

        }
    }


    const export_png = async () => {
        var img_url = await props.get_image_url();
        if (img_url !== "") {
            window.electron.download(img_url, { filename: filename });
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
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};