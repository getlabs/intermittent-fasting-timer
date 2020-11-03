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



let eatingBegin = new Date()
eatingBegin.setHours(time[0])
eatingBegin.setMinutes(time[1])

let nextEatingBegin = new Date()
nextEatingBegin.setDate(new Date().getDate() + 1)
nextEatingBegin.setHours(eatingBegin.getHours())
nextEatingBegin.setMinutes(0)

let eatingEnd = addHours(eatingBegin, fields[0]);
eatingEnd.setMinutes(eatingBegin.getMinutes());

let originalEatingBeginn = eatingBegin

if (!isTimeBetween(eatingBegin, eatingEnd) && isDateBefore(eatingBegin)) {
    console.log('set begin to tomorrow')
    eatingBegin = nextEatingBegin
}

var diffMsEating = (eatingBegin - new Date());
var diffHrsEating = Math.floor((diffMsEating % 86400000) / 3600000);
var diffMinsEating = Math.round(((diffMsEating % 86400000) % 3600000) / 60000);

var diffMsEatingEnd = (eatingBegin - eatingEnd);
var diffHrsEatingEnd = Math.floor((diffMsEatingEnd % 86400000) / 3600000);
var diffMinsEatingEnd = Math.round(((diffMsEatingEnd % 86400000) % 3600000) / 60000);

let minsRemainingEating = Math.floor(diffMinsEating + (diffHrsEating * 60))
let minsRemainingEatingEnd = Math.floor(diffMinsEatingEnd + (diffHrsEatingEnd * 60))

let totalEatingMins = fields[0] * 60
let totalFastingMins = (24 - fields[0]) * 60

let minsRemainingEatingCircle = Math.floor((minsRemainingEating / totalEatingMins * 100) * 3.6)

let minsRemainingEatingEndCircle = Math.abs((minsRemainingEating / totalFastingMins * 100) * 3.6)


/*
BEGIN Widget Layout
*/

let widget = new ListWidget();
widget.setPadding(0, 5, 1, 0);


let dayRadiusOffset = 60;

makeCircle(dayRadiusOffset,
    !isFastingPeriod() ? bgCircleColoreatingEnd : bgCircleColorFasting,
    (!isTimeBetween(originalEatingBeginn, eatingEnd) && !isDateBefore(originalEatingBeginn)) ? progressCircleColorFasting : progressCircleColoreatingEnd,
    !isFastingPeriod() ? Math.abs(minsRemainingEatingCircle) : Math.abs(minsRemainingEatingEndCircle),
    circleTextColor)

let outputHrs
let outputMin

if (!isFastingPeriod()) {
    outputHrs = Math.abs(diffHrsEatingEnd) > 9 ? Math.abs(diffHrsEatingEnd).toString() : '0' + Math.abs(diffHrsEatingEnd)
} else {
    outputHrs = diffHrsEating > 9 ? diffHrsEating.toString() : '0' + Math.abs(diffHrsEating)
}

if (!isFastingPeriod()) {
    outputMin = Math.abs(diffMinsEatingEnd) > 9 ? Math.abs(diffMinsEatingEnd).toString() : '0' + Math.abs(diffMinsEatingEnd)
} else {
    outputMin = diffMinsEating > 9 ? diffMinsEating.toString() : '0' + Math.abs(diffMinsEating)
}

const headerGer = (!isTimeBetween(originalEatingBeginn, eatingEnd) && !isDateBefore(originalEatingBeginn)) ? 'Fastenzeit beginnt in:' : 'Fastenzeit endet in:'
const headerEng = (!isTimeBetween(originalEatingBeginn, eatingEnd) && !isDateBefore(originalEatingBeginn)) ? 'Fasting period starting in:' : 'Fasting period ends in:'

drawText(
    lang === 'de' ? headerGer : headerEng,
    circleTextColor,
    20, 22
)
drawText(
    outputHrs + ':' + outputMin,
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

function isTimeBetween(startTime, endTime) {
    if (Date.parse(new Date()) <= Date.parse(endTime) && Date.parse(new Date()) >= Date.parse(startTime)) {
        return true;
    }
    return false
}

function addHours(date, h) {
    date.setTime(date.getTime() + (h * 60 * 60 * 1000));
    return date;
}

function isDateBefore(date) {
    var now = new Date();

    if (date < now) {
        return true
    } else {
        return false
    }
}

function isFastingPeriod() {
    return !isTimeBetween(eatingBegin, eatingEnd) && !isDateBefore(eatingBegin)
}