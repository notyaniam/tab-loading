let bgImage;

function backgroundImage() {
  return new Promise((resolve, reject) => {
    // loading image from unsplash url
    const loadImage = async () => {
      const url = "https://source.unsplash.com/1600x900/?nature";
      const res = await fetch(url);
      const imageBlob = await res.blob();
      const imageUrl = await imageConverter(imageBlob);
      localStorage.setItem("backgroundImage", JSON.stringify(imageUrl));
      loadBackgroundImage();
      return bgImage;
    };

    // check if there is internet connection
    const onlineStatus = navigator.onLine;

    if (onlineStatus) {
      resolve(loadImage());
    } else {
      loadBackgroundImage();
      resolve(bgImage);
    }
  });
}

// function to convert image to base64 for storage
function imageConverter(image) {
  let result;
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      // read file as data url
      reader.readAsDataURL(image);
      // await the image to finish loading
      reader.onload = function () {
        result = reader.result;
        //   console.log(reader.result);
        resolve(result);
      };
    } catch (err) {
      reject(err);
    }
  });
}

// setting background image to the canvas
function loadBackgroundImage() {
  // get background image from the local storage if exists
  bgImage = localStorage.getItem("backgroundImage")
    ? JSON.parse(localStorage.getItem("backgroundImage"))
    : null;
}
