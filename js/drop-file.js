var dropRegion = document.createElement("div")

dropRegion.setAttribute('id', "drop-region")

var dropRegionInner = '<div class="drop-message"\>\
                        Drag & Drop images or click to upload\
                            </div>\
                <div id="image-preview"></div>'

dropRegion.innerHTML = dropRegionInner


var fakeInput = fakeInput = document.createElement("input");

fakeInput.type = "file";
fakeInput.accept = "image/*";
fakeInput.multiple = false;


fakeInput.addEventListener("change", function() {
    var files = fakeInput.files;
    handleFiles(files);
});

// where images are previewed

// open file selector when clicked on the drop region
    

dropRegion.addEventListener('click', function() {
    console.log('event')
    fakeInput.click();
});



dropRegion.addEventListener('dragenter', preventDefault, false)
dropRegion.addEventListener('dragleave', preventDefault, false)
dropRegion.addEventListener('dragover', preventDefault, false)
dropRegion.addEventListener('drop', preventDefault, false)


dropRegion.addEventListener('drop', handleDrop, false);


function createDropRegion(){
    // where files are dropped + file selector is opened

    document.body.appendChild(dropRegion)
}

createDropRegion()

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}


function handleDrop(e) {

    var dt = e.dataTransfer,
        files = dt.files;

    if (files.length) {

        handleFiles(files);
        
    } else {

        // check for img
        var html = dt.getData('text/html'),
            match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
            url = match && match[1];



        if (url) {
            uploadImageFromURL(url);
            return;
        }

}


function uploadImageFromURL(url) {
    var img = new Image();
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");

    img.onload = function() {
        c.width = this.naturalWidth;     // update canvas size to match image
        c.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);       // draw in image
        c.toBlob(function(blob) {        // get content as PNG blob

            // call our main function
            handleFiles( [blob] );

        }, "image/png");
    };
    img.onerror = function() {
        alert("Error in uploading");
    }
    img.crossOrigin = "";              // if from different origin
    img.src = url;
}

}


function handleFiles(files) {
    
    console.log(files.length)

    for (var i = 0, len = files.length; i < len; i++) {
        if (validateImage(files[i]))
            previewAnduploadImage(files[i]);
    }
}

function validateImage(image) {
// check the type
    var validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg','image/svg+xml'];
    
    if (validTypes.indexOf( image.type ) === -1) {
        
        alert("Invalid File Type");
        console.log(image.type)
        return false;
    }

    // check the size
    var maxSizeInBytes = 10e6; // 10MB
    if (image.size > maxSizeInBytes) {
        alert("File too large");
        return false;
    }

    return true;

}

var height = 0
var width = 0

function previewAnduploadImage(image) {

    // container
    // var imgView = document.createElement("div");
    // imgView.className = "image-view";

    // var imagePreviewRegion = document.getElementById("image-preview");
    // imagePreviewRegion.appendChild(imgView);

    // // previewing image
    // var img = document.createElement("img");
    // imgView.appendChild(img);

    // progress overlay
    // var overlay = document.createElement("div");
    // overlay.className = "overlay";
    // imgView.appendChild(overlay);

    var img = new Image();

    img.onload = function(){
        
        height = img.height;
        width = img.width;
        createMap(img)

        // code here to use the dimensions
      }
    // read the image...
    var reader = new FileReader();
    
    reader.onload = function(e) {
        img.src = e.target.result;  
    }
    reader.readAsDataURL(image);

}

var map_id = 'image-map'

function createMap(img){

    var mapElement = document.createElement('div')
    mapElement.setAttribute('id', map_id)
    document.body.appendChild(mapElement)

    var map = new L.map(map_id, {
        minZoom: 1,
        maxZoom: 10,
        center: [0, 0],
        zoom: 1,
        crs: L.CRS.Simple
      });
      
      console.log(img.height)
      // dimensions of the image
      var w = width,
          h = height
        //   url = 'C:\\Users\\noize\\SVGViewer\\img\\EWiseAddMuldSC.svg';
      
      // calculate the edges of the image, in coordinate space
      var southWest = map.unproject([0, h], 4);
      var northEast = map.unproject([w, 0], 4);
      var bounds = new L.LatLngBounds(southWest, northEast);

      L.imageOverlay(img, bounds).addTo(map);
  
  // tell leaflet that the map is exactly as big as the image
        // map.setMaxBounds(bounds);
    
        L.easyButton('<img alt="close" src="img/close.png" height="40%" align="center">', function(btn, map){
            clearContainer(map);
            createDropRegion();
        }).addTo(map);

        dropRegion.parentNode.removeChild(dropRegion)
}

function clearContainer(map) {
    
    let mapToDelete = document.getElementById(map_id)
    
    mapToDelete.parentNode.removeChild(mapToDelete);


    if (map && map.remove) {
        map.off();
        map.remove();
      }
}
