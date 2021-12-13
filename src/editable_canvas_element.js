import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Rect, Transformer, Group, Image } from 'react-konva';
import { Html } from "react-konva-utils";
import { toCanvas } from 'html-to-image';

const TransformableHtml = forwardRef(({ children, shapeProps, isSelected, onSelect, onChange, id , keepRatio=false}, ref) => {
    const groupRef = useRef();
    const trRef = useRef();
    const [shape, setShape] = useState(shapeProps);

    const htmlref = useRef(null);
    const [img, setImg] = useState(null);
    const padding = 6;
    const remake = () => {
        if (htmlref.current !== null) {
            const html = htmlref.current;
            toCanvas(html, { pixelRatio: 2 }).then((canvas) => setImg(canvas));
        }
    }
    useEffect(() => {
        remake();
    }, []);
    useImperativeHandle(ref, () => ({
        "remake": () => remake()
    }));

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Group
                onClick={() => { onSelect(); console.log("keep ratio: ", keepRatio); }}
                onTap={onSelect}
                ref={groupRef}
                {...shape}
                draggable={isSelected}
                onDragStart={(e) => {
                    onSelect();
                }}
                onDragMove={e => {
                    var new_shape = {
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    }
                    setShape(new_shape);
                }}
                onDragEnd={(e) => {
                    var new_shape = {
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    }
                    onChange(new_shape);
                    setShape(new_shape);
                    remake();
                }}
                onTransform={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = groupRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    var new_shape = {
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                        rotation: node.rotation(),
                    };
                    setShape(new_shape);
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = groupRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    var new_shape = {
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                        rotation: node.rotation(),
                    };
                    onChange(new_shape);
                    setShape(new_shape);
                    remake();
                }}
            >
                <Rect id={id} x={0} y={-12} width={shape.width} height={shape.height + 12} cornerRadius={6} fill={"silver"} />
                <Html divProps={{ style: { position: "absolute", left: padding + "px", top: padding + "px", width: shape.width - 2 * padding + "px", height: shape.height - 2 * padding + "px" } }}>
                    <div ref={htmlref} style={{
                        width: "100%",
                        height: "100%",
                    }}>
                        {children}
                    </div>
                </Html>
                <Image image={img} x={padding} y={padding} width={shape.width - 2 * padding} height={shape.height - 2 * padding} />
            </Group>
            {
                isSelected && (
                    <Transformer
                        ref={trRef}
                        rotateEnabled={false}
                        keepRatio={keepRatio}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )
            }
        </React.Fragment >
    );
});

export const TextBox = ({ text, shapeProps, id, isSelected, onSelect, onShapeChange, onTextChange }) => {
    const htmlref = useRef(null);
    const textref = useRef(null);
    useEffect(() => {
        if (textref.current) {
            textref.current.focus();
        }
    }, []);
    return (
        <TransformableHtml
            ref={htmlref}
            shapeProps={shapeProps}
            isSelected={isSelected}
            onSelect={() => { onSelect() }}
            id={id}
            onChange={(newAttrs) => { onShapeChange(newAttrs) }}
        >

            <textarea
                ref={textref}
                value={text}
                onChange={(e) => {
                    onTextChange(e.target.value);
                    if (htmlref.current) {
                        htmlref.current.remake();
                    }
                }}
                placeholder="Type here"
                style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    outline: "none",
                }}
            />

        </TransformableHtml>
    );
}

export const Video = ({ src, shapeProps, id, isSelected, onSelect, onShapeChange }) => {
    const htmlref = useRef(null);
    const mediaref = useRef(null);
    useEffect(() => {
        if (mediaref.current) {
            mediaref.current.focus();
        }
    }, []);
    return (
        <TransformableHtml
            ref={htmlref}
            shapeProps={shapeProps}
            isSelected={isSelected}
            onSelect={() => { onSelect() }}
            id={id}
            onChange={(newAttrs) => { onShapeChange(newAttrs) }}
            keepRatio={true}
        >
            <video
                ref = {mediaref}
                controls={true}
                style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    outline: "none",
                }}
            >
                <source src={src} />
            </video>

        </TransformableHtml>
    );
}

export const Audio = ({ src, shapeProps, id, isSelected, onSelect, onShapeChange }) => {
    const htmlref = useRef(null);
    const mediaref = useRef(null);
    useEffect(() => {
        if (mediaref.current) {
            mediaref.current.focus();
        }
    }, []);
    return (
        <TransformableHtml
            ref={htmlref}
            shapeProps={shapeProps}
            isSelected={isSelected}
            onSelect={() => { onSelect() }}
            id={id}
            onChange={(newAttrs) => { onShapeChange(newAttrs) }}
            
        >
            <audio
                ref={mediaref}
                controls={true}
                style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    outline: "none",
                }}
            >
                <source src={src} />
            </audio>

        </TransformableHtml>
    );
}
