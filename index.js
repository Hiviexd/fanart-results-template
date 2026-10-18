const fs = require("fs");
const path = require("path");

const root = __dirname;
const slug = process.argv[2];

if (!slug) {
    console.error("Usage: node index.js <slug>");
    process.exit(1);
}

const contests = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
const contest = contests.find((entry) => entry.slug === slug);

if (!contest) {
    console.error(`No contest with slug "${slug}" in config.json`);
    process.exit(1);
}

const csvPath = path.join(root, "input", `${slug}.csv`);
if (!fs.existsSync(csvPath)) {
    console.error(`Missing input file: input/${slug}.csv`);
    process.exit(1);
}

const entries = parseCsv(fs.readFileSync(csvPath, "utf8"));
const podium = pickByRank(entries, range(1, contest.podium), "podium");
const ppyPicks = pickByRank(entries, contest.ppyPicks, "ppyPicks");

const title = `${contest.name}: Results`;
const filename = `${datePrefix(contest.date)}-${slugify(title)}`;

const replacements = {
    "{{CONTEST_NAME}}": contest.name,
    "{{DATE_TIME}}": contest.date,
    "{{AUTHOR}}": contest.author,
    "{{FILENAME}}": filename,
    "{{PODIUM_BANNERS}}": banners(podium),
    "{{PPY_PICK_BANNERS}}": banners(ppyPicks),
};

let markdown = fs.readFileSync(path.join(root, "example.md"), "utf8");
for (const [token, value] of Object.entries(replacements)) {
    markdown = markdown.replaceAll(token, value);
}

const outputDir = path.join(root, "output");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${filename}.md`);
fs.writeFileSync(outputPath, markdown);
console.log(`Wrote ${path.relative(root, outputPath)}`);

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (quoted) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    quoted = false;
                }
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            quoted = true;
        } else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n" || char === "\r") {
            if (char === "\r" && text[i + 1] === "\n") i++;
            row.push(field);
            if (row.some((value) => value !== "")) rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    if (field !== "" || row.length) {
        row.push(field);
        rows.push(row);
    }

    const [header, ...body] = rows;
    return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function range(from, to) {
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function pickByRank(entries, ranks, label) {
    return ranks.map((rank) => {
        const entry = entries[rank - 1];
        if (!entry) {
            throw new Error(`${label} rank ${rank} is out of range (${entries.length} entries)`);
        }
        return entry;
    });
}

function banners(rows) {
    return rows.map((row) => encodeBannerUrls(row.banner_string)).join("\n\ndescription\n\n");
}

function encodeBannerUrls(banner) {
    return banner.replace(/\]\((https?:\/\/[^)]+)\)/g, (_, url) => `](${encodeURI(url)})`);
}

function datePrefix(dateTime) {
    const match = String(dateTime).match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) {
        throw new Error(`Invalid date "${dateTime}", expected YYYY-MM-DD ...`);
    }
    return match[0];
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
