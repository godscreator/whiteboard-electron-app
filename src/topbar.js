import "./topbar_styles.css";
import React from "react";
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/Navdropdown'
import Nav from 'react-bootstrap/Nav'
import Container from "react-bootstrap/Container"
import "bootstrap/dist/css/bootstrap.min.css";

export default function Topbar(props) {
    return (
        <div className="top-bar">
            <Navbar expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href=".">White Board</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="File" id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={() => props.clear()}>New</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => props.open()}>Open</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => props.save()}>Save</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => props.export_as()}>Save As</NavDropdown.Item>
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