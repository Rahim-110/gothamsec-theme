# GothamSec CTFd Theme

A cyberpunk/tech noir themed CTFd theme with GothamSec branding.

## Installation

1. Clone this repository into your CTFd themes directory:
   ```bash
   cd /path/to/CTFd/CTFd/themes/
   git clone https://github.com/YOUR_USERNAME/gothamsec-theme.git gothamsec
   ```

2. Restart CTFd or reload the application.

3. Go to **Admin Panel → Config → Theme** and select `gothamsec`.

## Structure

```
gothamsec/
├── static/
│   ├── css/         # Theme stylesheets
│   ├── js/          # Theme JavaScript
│   └── img/         # Theme images
├── templates/       # Jinja2 templates
└── theme.json       # Theme configuration
```

## Updates

To update the theme on your server:
```bash
cd /path/to/CTFd/CTFd/themes/gothamsec
git pull origin main
```

Then restart CTFd to apply changes.
