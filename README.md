# yt-shorts

CLI tool for managing YouTube Shorts.

## Setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable **YouTube Data API v3**
3. Create **OAuth 2.0 credentials** (Web application type)
4. Add `http://localhost:3000` as authorized redirect URI
5. Download credentials as `client_secrets.json` in this directory
6. Run `yt-shorts auth`

### Requirements

- Node.js 18+
- `yt-dlp` (for clone command): `brew install yt-dlp`
- `ffmpeg` (for validation): `brew install ffmpeg`

## Installation

```bash
npm install
npm run build
npm link  # Makes yt-shorts available globally
```

## Commands

### `yt-shorts auth`
Authenticate with YouTube (required before other commands).

### `yt-shorts list [options]`
List your channel's videos.

| Option | Description |
|--------|-------------|
| `--max, -n <num>` | Max videos to show (default: 10) |
| `--privacy <status>` | Filter: public, private, unlisted |
| `--format <type>` | Output: table, json (default: table) |

```bash
yt-shorts list
yt-shorts list --max 20 --format json
yt-shorts list --privacy public
```

### `yt-shorts upload <file> [options]`
Upload a video as a YouTube Short.

| Option | Description |
|--------|-------------|
| `--title, -t <title>` | Video title (required) |
| `--description, -d <desc>` | Video description |
| `--tags <t1,t2,...>` | Comma-separated tags |
| `--privacy <status>` | public, private, unlisted (default: private) |
| `--skip-validation` | Skip Shorts requirements check |
| `--force` | Upload even if validation fails |

```bash
yt-shorts upload video.mp4 --title "My Short"
yt-shorts upload video.mp4 -t "Gaming Clip" -d "Epic moment" --tags gaming,clips --privacy public
```

### `yt-shorts update <video-id> [options]`
Update metadata on an existing video.

| Option | Description |
|--------|-------------|
| `--title, -t <title>` | New title |
| `--description, -d <desc>` | New description |
| `--tags <t1,t2,...>` | Replace tags |
| `--privacy <status>` | Change privacy status |

```bash
yt-shorts update abc123 --title "New Title"
yt-shorts update abc123 --privacy unlisted
yt-shorts update abc123 -t "Title" -d "Description" --tags tag1,tag2
```

### `yt-shorts clone <video-id> [options]`
Download a video and re-upload with new metadata.

| Option | Description |
|--------|-------------|
| `--title, -t <title>` | Title for clone (required) |
| `--description, -d <desc>` | Description (defaults to original) |
| `--tags <t1,t2,...>` | Tags (defaults to original) |
| `--privacy <status>` | Privacy (default: private) |
| `--keep-file` | Keep downloaded video file |

```bash
yt-shorts clone abc123 --title "Cloned Video"
yt-shorts clone abc123 -t "New Version" --privacy public --keep-file
```

### `yt-shorts validate <file>`
Check if a video meets YouTube Shorts requirements (duration, aspect ratio).

```bash
yt-shorts validate video.mp4
```
