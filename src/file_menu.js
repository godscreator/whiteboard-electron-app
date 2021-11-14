import "./file_menu_styles.css";
import React from "react";
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/Navdropdown'
import Nav from 'react-bootstrap/Nav'
import Container from "react-bootstrap/Container"
import "bootstrap/dist/css/bootstrap.min.css";

export default function Topbar(props) {
    var filename = "";
    //var filedata = [];



    const new_file = () => {
        props.clear();
        filename = "";
    }
    const open_file = () => {
        window.electron.open_dialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text', extensions: ['txt'] },
                { name: 'JSON', extensions: ['json'] },
            ]
        },
            result => {
                var filepath = result[0];
                filename = filepath;
                window.electron.read_file(filepath, 'utf-8',
                    result => {
                        console.log("The file content is : " + result);
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
        if (filename !== "") {
            window.electron.save_dialog({
                filters: [
                    { name: 'Text', extensions: ['txt'] },
                    { name: 'JSON', extensions: ['json'] },
                ],
                defaultPath: "untitled"
            },
                filepath => {
                    filename = filepath;
                    window.electron.write_file(filepath, "henlo mr dj",
                        result => {
                            console.log("The result : " + result);
                        },
                        err => console.log(err)
                    );
                },
                err => console.log(err)
            );
        } else {
            window.electron.write_file(filename, "henlo mr dj",
                result => {
                    console.log("The result : " + result);
                },
                err => console.log(err)
            );
        }
    }


    const export_png = () => {
        var img_url = props.get_image_url();
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