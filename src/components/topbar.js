import "./topbar.css";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { getPagesData, reset, updatePageImage, newFile, openFile, insertMedia, saveFile, changePath } from '../redux';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/Navdropdown';
import Nav from 'react-bootstrap/Nav';
import Container from "react-bootstrap/Container";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Spinner from 'react-bootstrap/Spinner';
import "bootstrap/dist/css/bootstrap.min.css";

const Topbar = forwardRef((props, ref) => {
    const c_filename = useSelector(state => state.currentFile.filename);
    const c_folderpath = useSelector(state => state.currentFile.folderpath);
    const loading = useSelector(state => state.currentFile.loading);
    const loading_error = useSelector(state => state.currentFile.err);
    const pages_images_urls = useSelector(state => state.pages.pages_images);
    const active = useSelector(state => state.pages.active);

    const dispatch = useDispatch();

    const [showToast, setShowToast] = useState(loading);
    const [filename, setFilename] = useState(c_filename);

    useEffect(() => {
        setFilename(c_filename);
    }, [c_filename]);

    useEffect(() => {
        if (loading) {
            setShowToast(true);
        }
    }, [loading]);

    const new_file = () => {
        props.clear();
        dispatch(newFile())
        dispatch(reset());
    }

    const open_file = () => {
        new_file();
        openFile()(dispatch);
    };

    const open_media = () => {
        insertMedia()(dispatch);
    };

    const save_file = () => {
        saveFile(c_folderpath, filename, getPagesData())(dispatch);
    }


    const export_png = () => {
        var { url, page_no } = props.get_image_url();
        if (url !== "") {
            dispatch(updatePageImage(url));
            window.electron.download(url, { filename: filename.replace(".wbrd", "_" + (page_no + 1) + ".png"), openFolderWhenDone: true });
        }
    }
    const export_pdf = () => {
        var { url } = props.get_image_url();
        if (url !== "") {
            dispatch(updatePageImage(url));
            var images = pages_images_urls.slice();
            images[active] = url;
            window.electron.images_to_pdf(images, { filename: filename.replace(".wbrd", ".pdf"), openFolderWhenDone: true });
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

                    <Navbar.Text href=".">
                        <input
                            type="text"
                            value={c_filename}
                            onChange={(e) => {
                                var fname = e.target.value.split(".")[0] + ".wbrd";
                                setFilename(fname);
                                dispatch(changePath(c_folderpath, fname));
                            }}
                            placeholder="file name"
                            spellCheck="false"
                            style={{ resize: "none", outline: "none", height: "100%" }}
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
                                <NavDropdown.Item onClick={() => export_pdf()}>Export PDF</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Edit" id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={() => open_media()}>Insert Media</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <ToastContainer bg="dark" position="top-end">
                <Toast bg="dark" show={showToast} onClose={() => { setShowToast(false) }}>
                    <Toast.Header>
                        <strong className="me-auto">Whiteboard</strong>
                    </Toast.Header>
                    <Toast.Body>{loading_error ? ("Error:" + loading_error) : (loading ? ("loading..." && < Spinner key="spin" animation="border" />) : "Done")}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
});

export default Topbar;