// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// Concentric circle V3

const canvSize = 282;
const canvTextSize = 40;
const canvas = new DrawContext();
canvas.opaque = false

const widgetBGColor = new Color('000'); //Widget background color
const circleTextColor = new Color('#fff'); //Widget text color 

const bgCircleColorFasting = new Color('00382c')
const bgCircleColoreatingEnd = new Color('382e00') // bg circle color, full circle 382e00
const progressCircleColoreatingEnd = new Color('24ffd7')
const progressCircleColorFasting = new Color('FFD723')

const argsParam = args.widgetParameter
const fields = argsParam ? argsParam.split(',') : []
const time = fields[1] ? fields[1].split(':') : '13:00'

const device = Device
const lang = device.language()

const canvWidth = 24; // circle thickness
const canvRadius = 160; // circle radius

canvas.size = new Size(canvSize, canvSize);
canvas.respectScreenScale = true;

const eatingTime = new Date()
eatingTime.setHours(time[0])
eatingTime.setMinutes(time[1])

let times = [
    [time[0], time[1]], [addHours(eatingTime, fields[0]).getHours(), addHours(eatingTime, fields[0]).getMinutes()]
]

const headerGer = isEatingTime() ? 'Fastenzeit beginnt in:' : 'Fastenzeit endet in:'
const headerEng = isEatingTime() ? 'Fasting period starting in:' : 'Fasting period ends in:'

let totalEatingMins = fields[0] * 60
let totalFastingMins = (24 - fields[0]) * 60

let minsRemainingCircle = isEatingTime() ? Math.floor((getMins() / totalEatingMins * 100) * 3.6) : Math.floor((getMins() / totalFastingMins * 100) * 3.6)

let dayRadiusOffset = 60;

/*
START Widget Layout
*/

let widget = new ListWidget();
widget.setPadding(0, 5, 1, 0);
makeCircle(dayRadiusOffset,
    isEatingTime() ? bgCircleColoreatingEnd : bgCircleColorFasting,
    isEatingTime() ? progressCircleColorFasting : progressCircleColoreatingEnd,
    Math.floor(minsRemainingCircle),
    circleTextColor)

drawText(
    lang === 'de' ? headerGer : headerEng,
    circleTextColor,
    20, 22
)
drawText(
    getMinOutput(),
    circleTextColor,
    140, 40
)

drawText(
    lang === 'de' ? 'Stunden' : 'Hours',
    circleTextColor,
    200, 22
)

widget.backgroundColor = widgetBGColor
widget.addImage(canvas.getImage())
Script.setWidget(widget);
widget.presentSmall();
Script.complete();

/*
END Widget Layout
*/

function makeCircle(radiusOffset, bgCircleColor, fgCircleColor, degree, txtColor) {
    let ctr = new Point(canvSize / 2, canvSize / 2)
    // Outer circle
    CoordOffset = 0
    RadiusOffset = 0
    bgx = ctr.x - (canvRadius - radiusOffset);
    bgy = ctr.y - (canvRadius - radiusOffset);
    bgd = 2 * (canvRadius - radiusOffset);
    bgr = new Rect(
        bgx + CoordOffset,
        bgy + CoordOffset + 20,
        bgd,
        bgd
    );

    canvas.setStrokeColor(bgCircleColor);
    canvas.setLineWidth(canvWidth);
    canvas.strokeEllipse(bgr);

    // Inner circle
    canvas.setFillColor(fgCircleColor);
    for (t = 0; t < degree; t++) {
        rect_x = ctr.x + (canvRadius - radiusOffset) * sinDeg(t) - canvWidth / 2;
        rect_y = ctr.y - (canvRadius - radiusOffset) * cosDeg(t) - canvWidth / 2;
        rect_r = new Rect(
            rect_x,
            rect_y + 20,
            canvWidth,
            canvWidth
        );
        canvas.fillEllipse(rect_r);
    }
}

function drawText(txt, txtColor, txtOffset, fontSize) {
    const txtRect = new Rect(
        canvTextSize / 2 - 20,
        txtOffset - canvTextSize / 2,
        canvSize,
        canvTextSize
    );
    canvas.setTextColor(txtColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.setTextAlignedCenter()
    canvas.drawTextInRect(txt, txtRect)
}

function sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
}

function cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
}

function pad(num) {
    return ("0" + parseInt(num)).substr(-2);
}

function getMinOutput() {
    let now = new Date()
    const nextShip = times.find(it => it[0] > now.getHours() || it[0] == now.getHours() && it[1] >= now.getMinutes()) || times[0];

    let hours = nextShip[0] - now.getHours();
    let minutes = nextShip[1] - now.getMinutes();

    if (minutes < 0) { minutes += 60; hours -= 1 }
    if (hours < 0) { hours += 24; }

    const seconds = 60 - now.getSeconds();

    return `${pad(hours)}:${pad(minutes)}`;
}

function getMins() {
    let now = new Date()
    const nextShip = times.find(it => it[0] > now.getHours() || it[0] == now.getHours() && it[1] >= now.getMinutes()) || times[0];

    let hours = nextShip[0] - now.getHours();
    let minutes = nextShip[1] - now.getMinutes();

    if (minutes < 0) { minutes += 60; hours -= 1 }
    if (hours < 0) { hours += 24; }

    const seconds = 60 - now.getSeconds();

    return hours * 60 + minutes;
}

function isEatingTime() {
    let now = new Date()
    const nextShip = times.findIndex(it => it[0] > now.getHours() || it[0] == now.getHours() && it[1] >= now.getMinutes()) || times[0];

    return nextShip === 1 ? true : false;
}

function addHours(date, h) {
    newDate = new Date()
    newDate.setTime(date.getTime() + (h * 60 * 60 * 1000));
    return newDate;
}
