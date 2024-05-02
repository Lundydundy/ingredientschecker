
import "./ImgContainer.css"

const ImgContainer = (props: any) => {

    return (
        <>
            <p>{props.allergy}</p>
            <div className="image-div">
                <canvas id="canvas"></canvas>
            </div>
        </>
    )
}

export default ImgContainer;