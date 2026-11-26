# Fanart contest news templating

Creates a fanart news post template from results, see structure in `example.md`.

This only automates the banner setup and other predictable stuff, you still need to write the actual content.

If you don't handle osu! fanart contests, this tool isn't for you.

## Run

Set up a contest entry in `config.json`, add the results CSV and name it using the slug you set, then run the script with said slug, for example:

```bash
node index.js halloween-2026
# This uses halloween-2026.csv and writes 2026-10-18-halloween-2026-fanart-contest-results.md
```

## Files

- `config.json`: contest metadata
- `input/{slug}.csv`: results for that contest
- `example.md`: post skeleton. Only the `{{...}}` bits are replaced
- `output/{date}-{title}.md`: generated draft, e.g. `2026-10-18-halloween-2026-fanart-contest-results.md`

## Config

```json
{
    "name": "Halloween 2026 Fanart Contest",
    "slug": "halloween-2026",
    "date": "2026-10-18 12:00:00",
    "author": "Hivie",
    "podium": 15,
    "ppyPicks": [110, 52, 50, 36, 26, 18]
}
```

- `name`: news post title
- `slug`: CSV filename (`input/{slug}.csv`)
- `date`: news post datetime (`YYYY-MM-DD HH:MM:SS`)
- `author`: signature at the bottom
- `podium`: how many top entries to include as finalists
- `ppyPicks`: extra ranks for peppy's picks
