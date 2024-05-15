

# Deploy Hexo blog on Github pages

## Step 1. Install Hexo Locally

Tips: Make sure to install Node.js and npm before proceeding. My Node version: 16.x
```bash
npm install -g hexo-cli
```

## Step 2. Create Empty GitHub Repo or Clone and Delete All Files (Example Using My Repo):

```bash
git clone https://github.com/locustbaby/locustbaby.github.io.git
cd locustbaby.github.io/ && rm -rf ./*
```

## Step 3. [hexo init](https://hexo.io/docs/setup)

Hexo init in a new folder, then copy all files to the repo.
```bash
cd ..
hexo init Cloak
cp -rf Cloak/* locustbaby.github.io/
```

## Step 4. clone the [archer theme](https://github.com/fi3ework/hexo-theme-archer)

```bash
cd locustbaby.github.io/ && git clone https://github.com/fi3ework/hexo-theme-archer.git themes/archer --depth=1
rm -rf theme/archer/.git/
```

## Step 5. add [github actions](https://hexo.io/docs/github-pages)

`mkdir .workflow/ && vim .workflow/pages.yaml` with the following:

```yaml
name: Pages

on:
  push:
    branches:
      - main  # default branch

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # If your repository depends on submodule, please see: https://github.com/actions/checkout
          submodules: recursive
      - name: Use Node.js 16.x
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Cache NPM dependencies
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Step 6. git add && commit && push 


## Plugins:

### 1. Sitemap
install sitemap plugin
```bash
npm install hexo-generator-sitemap --save
```
add template file

sitemap_template.txt
```txt
{% for post in posts %}{{ post.permalink | uriencode }}
{% endfor %}{{ config.url | uriencode }}
{% for tag in tags %}{{ tag.permalink | uriencode }}
{% endfor %}{% for cat in categories %}{{ cat.permalink | uriencode }}
{% endfor %}
```

sitemap_template.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% for post in posts %}
  <url>
    <loc>{{ post.permalink | uriencode }}</loc>
    {% if post.updated %}
    <lastmod>{{ post.updated | formatDate }}</lastmod>
    {% elif post.date %}
    <lastmod>{{ post.date | formatDate }}</lastmod>
    {% endif %}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  {% endfor %}

  <url>
    <loc>{{ config.url | uriencode }}</loc>
    <lastmod>{{ sNow | formatDate }}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  {% for tag in tags %}
  <url>
    <loc>{{ tag.permalink | uriencode }}</loc>
    <lastmod>{{ sNow | formatDate }}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.2</priority>
  </url>
  {% endfor %}

  {% for cat in categories %}
  <url>
    <loc>{{ cat.permalink | uriencode }}</loc>
    <lastmod>{{ sNow | formatDate }}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.2</priority>
  </url>
  {% endfor %}
</urlset>
```
append sitemap config to ${root}/_config.yml
```
sitemap:
  path: 
    - sitemap.xml
    - sitemap.txt
  template: ./sitemap_template.xml
  template_txt: ./sitemap_template.txt
  rel: false
  tags: true
  categories: true
```


## Refer:
https://mikolaje.github.io/2019/hexo_seo.html
