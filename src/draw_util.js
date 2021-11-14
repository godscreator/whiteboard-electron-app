

export const freehand = (context, points, radius, color) => {
    if (points.length >= 2) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = radius;
        context.strokeStyle = color;
        context.beginPath();
        var p = points[points.length - 2];
        context.moveTo(p.x, p.y);
        var q = points[points.length - 1];
        context.lineTo(q.x, q.y);
        context.stroke();
        context.closePath();
    }

}

export const shape = (context, points, radius, color, type) => {
    if (points.length === 2) {
        context.beginPath();
        context.lineWidth = radius;
        context.strokeStyle = color;
        const { x: startX, y: startY } = points[0];
        const { x: toX, y: toY } = points[1];
        switch (type) {
            case "rect":
                context.rect(startX, startY, toX - startX, toY - startY);
                break;
            case "fill rect":
                context.rect(startX, startY, toX - startX, toY - startY);
                context.fillStyle = color;
                context.fill();
                break;
            case "circle":
                context.arc(startX, startY, Math.hypot(toX - startX, toY - startY), 0, 2 * Math.PI);
                break;
            case "fill circle":
                context.arc(startX, startY, Math.hypot(toX - startX, toY - startY), 0, 2 * Math.PI);
                context.fillStyle = color;
                context.fill();
                break;
            case "line":
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(toX, toY);
                break;
            default:

        }

        context.stroke();
        context.closePath();
    }
}

export const erase = (context, points, radius) => {
    if (points.length > 2) {
        const o = points[points.length - 2];
        const p = points[points.length - 1];
        var t = o;
        var diff = Math.max(Math.abs(p.x - t.x), Math.abs(p.y - t.y));
        while (diff >= 1) {
            context.clearRect(t.x - radius / 2, t.y - radius / 2, radius, radius);
            if (t.x < p.x) t.x++;
            if (t.x > p.x) t.x--;
            if (t.y > p.y) t.y--;
            if (t.y < p.y) t.y++;
            diff = Math.max(Math.abs(p.x - t.x), Math.abs(p.y - t.y));
        }

    }
    context.closePath();
}