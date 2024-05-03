import { useEffect, useState } from 'react'
import Nav from './containers/Nav/Nav'
import ImgContainer from './containers/ImgContainer/ImgContainer'
import SubmitBtn from './containers/SubmitBtn/SubmitBtn'
import cv from "opencv-ts"



function App() {
  const [allergy, setAllergy]: any = useState("Take a picture of ingredients to see if allergens are present");
  const [imgSrc, setImgSrc]: any = useState(null)
  const [allergies, setAllergies]: any = useState(["wheat", "barley", "rye", "gluten", "milk"])

  
  useEffect(() => {
    if (cv) {
      // You can use cv here, for example:
      console.log('OpenCV library loaded:', cv);
      setAllergies(["wheat", "barley", "rye", "gluten", "milk"])
    }
  }, [cv]);
 

  useEffect(() => {
    if (allergies.length) {
      fetch("https://ingredientschecker.onrender.com/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allergies: allergies
        })
      })
        .then(response => response.json())
        .then(console.log)
    }
  }, [allergies])

  const handleImage = async (e: any) => {   

    const selectedImage = e.target.files[0];

    // Check if an image was selected
    if (!selectedImage) {
      console.log("No image selected");
      return;
    }

    const form = new FormData();
    form.append("file", selectedImage);
    const imgURL = URL.createObjectURL(selectedImage)
    const imgElement = new Image()
    imgElement.src = imgURL;
    setImgSrc(imgURL)

    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = reject;
    })

    cv.imshow("canvas", cv.imread(imgElement))
  

    try {
      // Send image to backend
      console.log("sending")
      const response = await fetch('https://ingredientschecker.onrender.com/processimg', {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        // Image uploaded successfully
        console.log("Image uploaded successfully");
        // Handle any further actions here
      } else {
        // Handle error response
        console.error("Error uploading image:", response.statusText);
      }

      const data = await response.json();
      console.log(data.result);

      await setAllergy(data.result.words)
      
      let cvimg = cv.imread(imgElement);

      for await (const box of data.result.boxes) {
        const x0 = box.x0, y0 = box.y0, x1 = box.x1, y1 = box.y1;
        const point1 = new cv.Point(x0 - 5, y0 - 5);
        const point2 = new cv.Point(x1, y1);
        console.log(point1, point2);
        cv.rectangle(cvimg, point1, point2, new cv.Scalar(255, 0, 0, 255), 3);
      }

      cv.imshow("canvas", cvimg);


    } catch (error) {
      // Handle fetch error
      console.error("Error uploading image:", error);
    }

  };

  return (
    <>
      <Nav />
      <div className='main-content'>
        <ImgContainer allergy={allergy} imgSrc={imgSrc} />
        <SubmitBtn handleImage={handleImage} />
        <p>{allergies.map((allergy: string, i: number) =>{
          return i !== allergies.length - 1 ? `${allergy.toUpperCase()}, ` : `${allergy.toUpperCase()}`
        })}</p>
      </div>
    </>
  )
}


export default App
