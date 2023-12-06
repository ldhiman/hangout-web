function AvatarImage(letters, size) {
    var letters = letters.toUpperCase();
    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");
    var size = size || 60;

    // Generate a random color every time function is called
    var color =  "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    if(color == '#ffffff'){
        color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    }
    // Set canvas with & height
    canvas.width = size;
    canvas.height = size;

    // Select a font family to support different language characters
    // like Arial
    context.font = Math.round(canvas.width / 2) + "px Arial";
    context.textAlign = "center";

    // Setup background and front color
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#e6e6e6";
    context.fillText(letters[0], size / 2, size / 1.5);

    // Set image representation in default format (png)
    dataURI = canvas.toDataURL();

    // Dispose canvas element
    canvas = null;

    return dataURI;
}