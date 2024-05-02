import "./SubmitBtn.css"

const SubmitBtn = (props: any) => {
    return (
        <div className="button-div">
            <button className="btn btn-primary"><label
                htmlFor="image">Capture</label></button>
            <input onChange={props.handleImage} id="image" type="file" accept="image/jpg" capture="user" />
        </div>
    )
}

export default SubmitBtn;