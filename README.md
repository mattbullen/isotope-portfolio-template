## Isotope.js Portfolio Template

A photo portfolio microsite template. The site uses [Isotope.js](http://isotope.metafizzy.co/) for photo sorting with [Handlebars.js](http://handlebarsjs.com/) templating for the layout. The modal view for each photo retrieves and shows any EXIF data recorded for it via [Exif.js](https://github.com/exif-js/exif-js). The gallery layout itself is configurable through a JSON file:

```javascript
{ 
    "list": [
        {
            "file": "100.jpg",
            "category": "beach"
        }, 
        etc.
    ],
    "sort": ["file", "category"],
    "random": "off",
    "filter-first": "beach",
    "filter-type": "single",
    "filter-labels": {
        "beach": "Beach Stock Photos",
        etc.
    }
}
```

The `list` array holds a list of image file names and the sort category for each. The `sort` array sets the menu options for sorting the images on the page. The `random` value sets the display order on page load to either the same as in the JSON list or to a random sort. The remaining `filter` options set the first menu category to display, whether or not to set the menu to select/view multiple categories at the same time, and optional display labels for each category of photo.

##### Try it out: www.matthewbullen.net/isotope-portfolio-template/index.html
