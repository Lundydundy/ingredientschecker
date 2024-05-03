
import "./ImgContainer.css"

const ImgContainer = (props: any) => {

    return (
        <>
            <p>{props.allergy.map((all: string) => {
                return props.allergy.length < 2 ? all : `${all.toUpperCase()} `;
            })}</p>
            <div className="image-div">
                <canvas id="canvas"></canvas>
            </div>
        </>
    )
}

export default ImgContainer;