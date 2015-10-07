;(function gallery() {

    // Setup

    var LAYOUT;

    $(document).ready(function() {
        init();
    });

    function init() {
        $.getJSON("./json/layout.json").done(function(data) {
            console.log("\nJSON:", data);
            LAYOUT = data;
            layoutBundle();
            isotopeBundle();
        });   
    }

    // Layout
    
    function layoutBundle() {
        setIsotopeFilter();
        setHTMLRem();
        setMenu();
        setSlides();
        setScroll();
        setThumbnails();
    }

    function setHTMLRem() {
        var oneVW = document.getElementById("html").clientWidth;
        oneVW = (oneVW * 0.000001) * 10000;
        document.getElementById("html").style.fontSize = "" + oneVW + "px !important";
        return oneVW;
    };

    function vw(a) {
        if (!a) { var a = 1; } else { a = 1 * a; }
        var oneVW = document.getElementById("html").clientWidth;
        return a * ((oneVW * 0.000001) * 10000);
    };

    function vh(a) {
        if (!a) { var a = 1; } else { a = 1 * a; }
        var oneVH = document.getElementById("html").clientHeight;
        return a * ((oneVH * 0.000001) * 10000);
    };

    function setMenu() {
        var template = Handlebars.compile($("#menu-template").html());
        $("#menu-content").html(template(LAYOUT));
        $("#filter-group .menu").each(function(i) {
            $(this).text($(this).text().replace("slide-", ""));
        });
    }

    function setSlides() {
        var template = Handlebars.compile($("#gallery-template").html());
        $("#gallery-content").html(template(LAYOUT));
    }
    
    function setScroll() {
        $(".nano").nanoScroller();
        $(".nano-pane").hide(0);
        for (var i = 0; i < 6; i++) { $("#spacer-" + i).hide(0); }
    }

    function setScrollEffect(count) {
        if (!count) { var count = LAYOUT.list.length; }
        $(".nano-pane").hide(0);
        $("#spacer-0").hide(0); $("#spacer-1").hide(0); $("#spacer-2").hide(0); $("#spacer-3").hide(0); $("#spacer-4").hide(0); $("#spacer-5").hide(0);
        if (count === 1) { window.setTimeout(function() { $("#spacer-0").show(); }, 500); }
        if (count === 2) { window.setTimeout(function() { $("#spacer-0").show(); $("#spacer-1").show(); }, 500); }   
        if (count > 2) { 
            window.setTimeout(function() { 
                $("#spacer-0").show(); $("#spacer-1").show(); $("#spacer-2").show();
            }, 500);
        }
        if (count > 9) {
            $(".nano").nanoScroller();
            $(".nano-pane").on("click", function() { slideMove(count); });
            $(".nano-slider").on("mousedown", function() { slideMove(count); });
            $(".nano-pane").on("mousemove", function() { slideMove(count); });
            $(".nano-slider").on("mouseup", function() { slideMove(count); });
            var mod = count % 3;
            if (mod === 0) { $("#spacer-3").show(0); $("#spacer-4").show(0); $("#spacer-5").show(0); }
            if (mod === 1) { $("#spacer-3").show(0); $("#spacer-4").hide(0); $("#spacer-5").hide(0); }
            if (mod === 2) { $("#spacer-3").show(0); $("#spacer-4").show(0); $("#spacer-5").hide(0); }
        } else {
            $(".nano-pane").hide(0);
            $("#spacer-3").hide(0); $("#spacer-4").hide(0); $("#spacer-5").hide(0); 
        }
    }
    
    function slideMove(count) {
        var mod = count % 3;
        var range = parseInt($(".upper-spacer-container").css("padding-top")) + $(".nano-pane").height();
        var sliderHeight = $(".nano-slider").height();
        var marginTop = parseInt($(".slide-box").css("margin-top")); // 23
        var border = parseInt($(".slide-box").css("border-top-width")) + parseInt($(".slide-box").css("border-bottom-width")); // 2
        // console.log(range, sliderHeight, marginTop, border);       
        window.setTimeout(function() { 
            var position = $(".nano-slider").offset().top;
            var bottom = range - (position + sliderHeight) + 3;
            var rows = (Math.floor(count / 3) + 1);
            var row = (range - marginTop - (rows * border)) / rows;
            if (bottom < row) {
                if (mod === 0) { $("#spacer-3").show(0); $("#spacer-4").show(0); $("#spacer-5").show(0); }
                if (mod === 1) { $("#spacer-3").show(0); $("#spacer-4").hide(0); $("#spacer-5").hide(0); }
                if (mod === 2) { $("#spacer-3").show(0); $("#spacer-4").show(0); $("#spacer-5").hide(0); }
            } else {
                // setScrollEffect(count);
                $("#spacer-3").show(0); $("#spacer-4").show(0); $("#spacer-5").show(0);
            }
            // console.log(mod, count, row, bottom, (bottom < row));
        }, 50);
    }
                
    function setThumbnails() {
        var slides = document.querySelectorAll(".slide-image");
        var i, item, slide;
        for (i = 0; i < LAYOUT.list.length; i++) {
            item = LAYOUT.list[i];
            slide = slides[i];
            getImageAndEXIF(item.file, item.label, slide, i);
        }
    };

    // Image and EXIF

    function getImageAndEXIF(file, label, slide, index) {  
        var http = new XMLHttpRequest();
        http.open("GET", "./img/" + file, true);
        http.responseType = "blob";
        http.onload = function(event) {
            if (this.status === 200) {
                var r = {};
                var image = new Image();
                image.src = URL.createObjectURL(http.response);
                image.onload = function() {
                    EXIF.getData(this, function() {
                        var tags = getEXIFTags();
                        var i, tag, exif;
                        for (i = 0; i < tags.length; i++) {
                            tag = tags[i];
                            exif = EXIF.getTag(this, tag);
                            if (exif) {
                                if (exif.numerator && exif.denominator) { exif = exif.numerator / exif.denominator; }
                                if (!r[tag]) { r[tag] = exif; }
                            }
                        }
                        LAYOUT.list[index].exif = r;
                        LAYOUT.list[index].image = image;
                        // console.log("\nImage:", LAYOUT.list[index]);
                        $(slide).fadeOut().html("");
                        window.setTimeout(function() {
                            slide.style.cssText += " background-image: url(" + image.src + ");";
                            slide.setAttribute("data-file-path", "./img/" + file);
                            slide.setAttribute("data-file-name", file);
                            slide.setAttribute("data-category", label);
                            slide.setAttribute("data-index", index);
                            slide.addEventListener("click", showModal, false);
                            $(slide).delay(300).fadeIn();
                        }, 400);
                    });
                };
            }
        };
        http.send();
    }

    function getEXIFTags() {
        return [
            // Regular EXIF
            "ExifVersion", 
            "FlashpixVersion",
            // "ColorSpace",
            "PixelXDimension",
            "PixelYDimension",
            // "ComponentsConfiguration",
            "CompressedBitsPerPixel",
            // "UserComment",
            // "RelatedSoundFile",
            // "DateTimeOriginal",
            // "DateTimeDigitized",
            "SubsecTime",
            // "SubsecTimeOriginal",
            // "SubsecTimeDigitized",
            "ExposureTime",
            "FNumber",
            "ExposureProgram",
            "SpectralSensitivity",
            "ISOSpeedRatings",
            "OECF",
            "ShutterSpeedValue",
            "ApertureValue",
            "BrightnessValue",
            "ExposureBias",
            "MaxApertureValue",
            "SubjectDistance",
            "MeteringMode",
            "LightSource",
            "Flash",
            "SubjectArea",
            "FocalLength",
            "FlashEnergy",
            "SpatialFrequencyResponse",
            "FocalPlaneXResolution",
            "FocalPlaneYResolution",
            "FocalPlaneResolutionUnit",
            "SubjectLocation",
            "ExposureIndex",
            "SensingMethod",
            "FileSource",
            "SceneType",
            "CFAPattern",
            "CustomRendered",
            "ExposureMode",
            "WhiteBalance",
            "DigitalZoomRation",
            "FocalLengthIn35mmFilm",
            "SceneCaptureType",
            "GainControl",
            "Contrast",
            "Saturation",
            "Sharpness",
            "DeviceSettingDescription",
            "SubjectDistanceRange",
            "InteroperabilityIFDPointer",
            "ImageUniqueID",
            "Make",
            "Model",
            // TIFF
            "ImageWidth",
            "ImageHeight",
            "ExifIFDPointer",
            "GPSInfoIFDPointer",
            "BitsPerSample",
            "Compression",
            "PhotometricInterpretation",
            "Orientation",
            "SamplesPerPixel",
            "PlanarConfiguration",
            // "YCbCrSubSampling",
            // "YCbCrPositioning",
            "XResolution",
            "YResolution",
            "ResolutionUnit",
            "StripOffsets",
            "RowsPerStrip",
            "StripByteCounts",
            "JPEGInterchangeFormat",
            "JPEGInterchangeFormatLength",
            "TransferFunction",
            "WhitePoint",
            "PrimaryChromaticities",
            // "YCbCrCoefficients",
            "ReferenceBlackWhite",
            "DateTime",
            "ImageDescription",
            "Make",
            "Model",
            "Software",
            // "Artist",
            // "Copyright" 
        ].sort(function(a, b){
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
        });
    }

    function formatEXIFTags(tag) {
        if (tag === "PixelXDimension") { return "Pixel X Dimension"; }
        if (tag === "PixelYDimension") { return "Pixel Y Dimension"; }
        if (tag === "ISOSpeedRatings") { return "ISO Speed Rating"; }
        if (tag === "FocalPlaneXResolution") { return "Focal Plane X Resolution"; }
        if (tag === "FocalPlaneYResolution") { return "Focal Plane Y Resolution"; }
        if (tag === "CFAPattern") { return "CFA Pattern"; }
        if (tag === "FNumber") { return "F-Number"; }
        if (tag === "FocalLengthIn35mmFilm") { return "Focal Length in 35mm Film"; }
        if (tag === "InteroperabilityIFDPointer") { return "Interoperability IFD Pointer"; }
        if (tag === "ImageUniqueID") { return "Image Unique ID"; }
        if (tag === "ExifIFDPointer") { return "Exif IFD Pointer"; }
        if (tag === "GPSInfoIFDPointer") { return "GPS Info IFD Pointer"; }
        // if (tag === "YCbCrSubSampling") { return "YCbCr Sub-Sampling"; }
        if (tag === "JPEGInterchangeFormat") { return "JPEG Interchange Format"; }
        if (tag === "JPEGInterchangeFormat") { return "JPEG Interchange Format Length"; }
        // if (tag === "YCbCrCoefficients") { return "YCbCr Coefficients"; }
        // if (tag === "YCbCrPositioning") { return "YCbCr Positioning"; }
        if (tag === "XResolution") { return "X Resolution"; }
        if (tag === "YResolution") { return "Y Resolution"; }
        return tag.replace(/([a-z])([A-Z])/g, "$1 $2");
    }

    function formatEXIFValue(value) {
        var parsed = parseFloat(value);
        if (parsed) {
            var abs = Math.abs(parsed);
            if (abs - Math.floor(abs) !== 0 ) {
                return parsed.toFixed(5);
            }
        }
        return value;
    }

    // Modal

    function showModal(event) {
        
        var overlay = document.createElement("div");
        overlay.id = "modal-overlay";
        overlay.onclick = hideModal;
        overlay.setAttribute("class", "modal-transition modal-invisible");
        
        var box = document.createElement("div");
        box.id = "modal-photo";
        box.onclick = hideModal;
        box.style.cssText = "position: fixed; top: 0px; left: 0px;";
        
        overlay.appendChild(box);
        document.getElementById("body").appendChild(overlay);
        
        box.style.cssText = "position: fixed !important;"
        + " top: " + ((vh(100) - box.offsetHeight) / 2) + "px;"
        + " left: " + ((vw(100) - box.offsetWidth) / 2) + "px;"
        + " background-image: url(" + event.target.getAttribute("data-file-path") + ");"
        + " background-size: auto 100%;"
        + " background-position: center center;"
        + " background-repeat: no-repeat;";
        
        overlay.setAttribute("class", "modal-transition");
        
        var list = document.createElement("div");
        list.id = "modal-exif-list";
        list.onclick = hideModal;
        list.style.cssText = "position: fixed; top: 0px; right: 0px; box-sizing: border-box; width: 250px; padding: 4px 16px; font-size: 0.667rem; background: rgb(55, 55, 55); border-left: 1px solid rgb(70, 70, 70); border-bottom: 1px solid rgb(70, 70, 70);";
        
        var file = event.target.getAttribute("data-file-name");
        var category = event.target.getAttribute("data-category");
        var content = '<h3 class="modal-exif-header">File</h3>'
        + '<p class="modal-exif-item">' + file + '</p>'
        + '<h3 class="modal-exif-header">Project</h3>'
        + '<p class="modal-exif-item" style="text-transform: capitalize">' + category + '</p>'
        + '<h3 class="modal-exif-header">EXIF Data</h3>';
        
        var index = event.target.getAttribute("data-index");
        var exif = LAYOUT.list[index].exif;
        if (Object.keys(exif).length > 0) {
            console.log("\nEXIF Data:", exif);
            for (var tag in exif) {
                content += '<p class="modal-exif-item">' + formatEXIFTags(tag) + ': ' + formatEXIFValue(exif[tag]) + '</p>';
            }   
        } else {
            content += '<p class="modal-exif-item">No EXIF Data Recorded</p>';
        }
        
        list.innerHTML = content;
        overlay.appendChild(list);
    };

    function hideModal() {
        var overlay = document.getElementById("modal-overlay");
        if (!overlay) { return false; }
        overlay.setAttribute("class", "modal-transition modal-invisible");
        window.setTimeout(function() {
            if (overlay && overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
        }, 300);
    };

    // Isotope

    function isotopeBundle() {
        var $grid = $("#gallery-content").isotope({
            layoutMode: "masonry",
            getSortData: setIsotopeSort()
        });
        startIsotopeFilter($grid);
        startIsotopeSort($grid);
        filterOnPageLoad($grid);
        filterTypeOnPageLoad();
    }

    function setIsotopeFilter() {
        var list = LAYOUT.list;
        var labels = LAYOUT["filter-labels"];
        var r = [];
        var i, item;
        for (i = 0; i < list.length; i++) {
            item = list[i].category;
            if (labels[item]) {
                var label = labels[item];
            } else {
                var label = item.charAt(0).toUpperCase() + item.slice(1);
            }
            var o = r.filter(function(o) {
                return o.category === item;
            })[0];
            if (!o) {
                r.push({
                    category: item,
                    label: label
                });
            }
            list[i].label = label;
        }
        r.sort(function(a, b){
            if (a.category < b.category) { return -1; }
            if (a.category > b.category) { return 1; }
            return 0;
        });
        LAYOUT.filter = r;
    }

    function setIsotopeSort() {
        var sort = LAYOUT.sort;
        var r = {};
        var i, item;
        for (i = 0; i < sort.length; i++) {
            item = sort[i];
            if (parseInt(item)) { item = item + " parseInt"; }
            if (!r[item]) { r[item] = "." + item; }
        }
        return r;
    }

    function startIsotopeFilter($grid) {
        var totalSlideCount = document.querySelectorAll(".slide-box").length;
        $("#filter-group").on("click", "div", function() {
            // console.log($("#filter-group .active").length, $("#filter-group .menu").length - 1);
            if ($(this).attr("id") === "filter-all") {
                $("#filter-group .active").removeClass("active");
                $(this).addClass("active");
                var filterValue = $(this).attr("data-filter");
                $grid.isotope({filter: filterValue, transitionDuration: "0.3s"});
                setScrollEffect(totalSlideCount); // console.log("1", totalSlideCount);
                window.setTimeout(function() { $(".nano").nanoScroller(); }, 300);
                return false;
            } else { 
                if ($(this).hasClass("active")) { $(this).removeClass("active"); } else { $(this).addClass("active"); }
                if ($("#filter-group .active").length === ($("#filter-group .menu").length - 1)
                    && $("#filter-type-group").attr("data-filter-type") !== "single") {
                    $("#filter-group .active").removeClass("active");
                    $("#filter-all").addClass("active");
                    var filterValue = $("#filter-all").attr("data-filter");
                    $grid.isotope({filter: filterValue, transitionDuration: "0.3s"});
                    setScrollEffect(totalSlideCount); // console.log("2", totalSlideCount);
                    $(".nano").nanoScroller();
                    return false;
                } else if ($("#filter-group .active").length === 0) {
                    $("#filter-all").addClass("active");
                    var filterValue = $("#filter-all").attr("data-filter");
                    $grid.isotope({filter: filterValue, transitionDuration: "0.3s"});
                    setScrollEffect(totalSlideCount); // console.log("3", totalSlideCount);
                    $(".nano").nanoScroller();
                    return false;
                } else {
                    $(".nano-pane").hide(0);
                    $("#filter-all").removeClass("active");
                    if ($("#filter-type-group").attr("data-filter-type") === "single") {
                        $("#filter-group .active").removeClass("active");
                        $(this).addClass("active");
                        var filterValue = $(this).attr("data-filter");
                    } else {
                        var filterValue = "filter";
                        var active = document.querySelectorAll("#filter-group .active");
                        var i = 0;
                        var value;
                        for (i = 0; i < active.length; i++) {
                            value = active[i].getAttribute("data-filter").replace(".", "");
                            filterValue += "-" + value;
                        }
                        var filter, slides, j, slide;
                        for (i = 0; i < active.length; i++) {
                            filter = $(active[i]).attr("data-filter");
                            slides = document.querySelectorAll(filter);
                            for (j = 0; j < slides.length; j++) {
                                slide = slides[j];
                                if ($(slide).hasClass(filterValue) === false) {
                                    $(slide).addClass(filterValue);
                                }
                            }
                        }
                        filterValue = "." + filterValue;
                    }
                    $grid.isotope({filter: filterValue, transitionDuration: "0.3s"});
                    var count = document.querySelectorAll(filterValue).length;
                    setScrollEffect(count); // console.log("4", count);
                    if (count > 9) { $(".nano").nanoScroller(); $(".nano-pane").show(); }
                    return false;
                }
            }
            // $grid.isotope({filter: filterValue, transitionDuration: "0.3s"});
        });
    }

    function startIsotopeSort($grid) {  
        $("#sort-group").on("click", "div", function() {
            $("#sort-group .active").removeClass("active");
            $(this).addClass("active");
            var sortValue = $(this).attr("data-sort");
            $grid.isotope({sortBy: sortValue, transitionDuration: "0.3s"});
        });
        if (LAYOUT.random === "true" || LAYOUT.random === "*" || LAYOUT.random === "") {
            $grid.isotope({sortBy : "random", transitionDuration: "0.3s"});
        }
    }
    
    function filterOnPageLoad($grid) {
        var filterValue = LAYOUT["filter-first"];
        if (filterValue !== "all" && filterValue !== "*") {
            filterValue = ".slide-" + filterValue;
            var count = document.querySelectorAll(filterValue).length;
        } else {
            var count = document.querySelectorAll(".slide-box").length;
        }
        $('div[data-filter="' + filterValue + '"]').addClass("active"); 
        $grid.isotope({filter: filterValue, transitionDuration: 0});
        setScrollEffect(count);
    }

    function filterTypeOnPageLoad() {
        var type = LAYOUT["filter-type"];
        $("#filter-type-group").attr("data-filter-type", type);
        $("#filter-type-" + type).addClass("active");
        $("#filter-type-group").on("click", "div", function() {
            if (!$(this).hasClass("active")) {
                $("#filter-type-group .active").removeClass("active");
                $(this).addClass("active");
                $("#filter-type-group").attr("data-filter-type", $(this).attr("data-filter-type"));
            }
        });
    }

})();