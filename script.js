let encodebtn = document.getElementById("encodebtn");
let encodeimage1fileinput = document.getElementById("encodeimage1");
let textFileInput = document.getElementById("textFile");

let canvasbox = document.getElementById("canvasbox");
let secretTextField = document.getElementById("secretText");
let downloadbtn = document.getElementById("downloadbtn");
let previewImg = document.getElementById("previewImg");

let loadedImage;
let encodedImage;

let decodebtn = document.getElementById("decodebtn");
let decodeimage1fileinput = document.getElementById("decodeimage1");
let decodeimage2fileinput = document.getElementById("decodeimage2");

let decodeimage1;
let decodeimage2;
let resetbtn = document.getElementById("resetbtn");
let resetbtn2 = document.getElementById("resetbtn2");
downloadDecodedTextBtn = document.getElementById("downloadDecodedTextBtn");

secretTextField.rows = 8;

// Image preview
encodeimage1fileinput.addEventListener("change", e => {
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width * 0.075;
            canvas.height = img.height * 0.075;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            previewImg.src = canvas.toDataURL();
            previewImg.style.display = "block";
        };
        img.src = URL.createObjectURL(encodeimage1fileinput.files[0]);
    } else {
        previewImg.style.display = "none";
    }
});
// Load text file and display content in textarea
// Load text file and display content in textarea
textFileInput.addEventListener("change", e => {
    const file = textFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            secretTextField.value = e.target.result;
        };
        reader.readAsText(file);
    }
});

encodebtn.addEventListener("click", e => {
    console.log("encoding...");
    encodebtn.classList.add("disabled");
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {
            loadedImage.loadPixels();
            console.log("Pixel data:", loadedImage.pixels);
            let secretText = secretTextField.value;
            console.log("secret message:", secretText);
            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);
            encodedImage.loadPixels();
            console.log("Pixel data:", encodedImage.pixels);
            encodeMessage(encodedImage, secretText);
            let newWidth = encodedImage.width * 0.075;
            let newHeight = encodedImage.height * 0.075;
            let canvas = createCanvas(newWidth, newHeight).parent('canvasbox');
            canvas.id('defaultCanvas0');
            image(encodedImage, 0, 0, newWidth, newHeight);
            downloadbtn.style.display = "block";
        });
    } else {
        alert("Please select an image file.");
    }
});


decodebtn.addEventListener("click", e => {
    console.log("decoding...");
    decodebtn.classList.add("disabled");

    // Check if both files are selected
    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0] && decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        // Load the two images
        loadImage(URL.createObjectURL(decodeimage1fileinput.files[0]), img1 => {
            loadImage(URL.createObjectURL(decodeimage2fileinput.files[0]), img2 => {
                img1.loadPixels();
                img2.loadPixels();
                console.log("image 1:", img1);
                console.log("image 2:", img2);

                // Decode the hidden message
                let decodedMessage = decodeMessage(img1, img2);
                console.log("Decoded Message:", decodedMessage);
                let endIndex = decodedMessage.indexOf('\0');
                if (endIndex !== -1) {
                    decodedMessage = decodedMessage.substring(0, endIndex);
                }
                secretTextField.value = decodedMessage;
                decodebtn.classList.remove("disabled");
                downloadDecodedTextBtn.style.display = "block";
            });
        });
    } else {
        alert("Please select both image files.");
    }
});

downloadDecodedTextBtn.addEventListener("click", e => {
    // Get the decoded text
    let decodedText = secretTextField.value;
    
    // Create a blob with the decoded text content
    let blob = new Blob([decodedText], { type: 'text/plain' });
    
    // Create a temporary link
    let link = document.createElement('a');
    // Set the href attribute to the object URL of the blob
    link.href = window.URL.createObjectURL(blob);
    // Set the download attribute with the desired filename
    link.download = 'decoded_text.txt';
    // Append the link to the document
    document.body.appendChild(link);
    // Programmatically trigger a click on the link
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
});

downloadbtn.addEventListener("click", e => {
    downloadEncodedImage(encodedImage, 'encoded_image.png');
});

resetbtn.addEventListener("click", e => {
    encodeimage1fileinput.value = "";
    textFileInput.value = "";
    secretTextField.value = "";
    previewImg.style.display = "none";
    downloadbtn.style.display = "none";
    clearCanvas();
});

resetbtn2.addEventListener("click", e => {
    decodeimage1fileinput.value = "";
    decodeimage2fileinput.value = "";
    secretTextField.value = "";
    previewImg.style.display = "none";
});

function clearCanvas() {
    let canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        canvas.remove();
    }
}

function setup() {}

function draw() {
    noLoop();
}

// Function to encode the message by modifying color channels
function encodeMessage(img, message) {
    let binaryMessage = textToBinary(message);
    img.loadPixels();

    let index = 0;
    for (let i = 0; i < img.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            if (index < binaryMessage.length) {
                // Get the binary value from the message
                let bit = int(binaryMessage[index]);

                // Only increment the color channel value if the bit is 1 and the current value is not at the maximum (255)
                if (bit === 1 && img.pixels[i + j] < 255) {
                    img.pixels[i + j]++;
                } else if (bit === 1 && img.pixels[i + j] == 255) {
                    img.pixels[i + j]--;
                }

                index++;
            }
        }
    }

    img.updatePixels();
}

function textToBinary(text) {
    let binaryMessage = '';
    for (let i = 0; i < text.length; i++) {
        let binaryChar = text[i].charCodeAt(0).toString(2);
        binaryMessage += '0'.repeat(8 - binaryChar.length) + binaryChar;
    }
    return binaryMessage;
}

function downloadEncodedImage(img, filename) {
    // Create a temporary link
    let link = document.createElement('a');
    // Convert the canvas to data URL
    let dataURL = img.canvas.toDataURL();
    // Set the href attribute of the link to the data URL
    link.href = dataURL;
    // Set the download attribute with the desired filename
    link.download = filename;
    // Append the link to the document
    document.body.appendChild(link);
    // Programmatically trigger a click on the link
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
}

// Function to decode the hidden message
function decodeMessage(originalImage, encodedImage) {
    let decodedMessage = "";
    originalImage.loadPixels();
    encodedImage.loadPixels();

    for (let i = 0; i < originalImage.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            // Compare color channel values and append to the decoded message
            let originalValue = int(originalImage.pixels[i + j]);
            let encodedValue = int(encodedImage.pixels[i + j]);

            // If color channel values are different, append '1', otherwise, append '0'
            if (originalValue !== encodedValue) {
                decodedMessage += '1';
            } else {
                decodedMessage += '0';
            }
        }
    }

    // Convert the binary message to text
    let textMessage = binaryToText(decodedMessage);
    return textMessage;
}

function binaryToText(binaryMessage) {
    let textMessage = "";
    for (let i = 0; i < binaryMessage.length; i += 8) {
        let byte = binaryMessage.substr(i, 8);
        textMessage += String.fromCharCode(parseInt(byte, 2));
    }
    return textMessage;
}