export default function timeToMs(time: number | string): number {
    if (typeof time === "number") return time * 1000;
    const split = time.split(":");
    const res = parseInt(split[0]) * 60 + parseInt(split[1]);
    return res * 1000;
}
