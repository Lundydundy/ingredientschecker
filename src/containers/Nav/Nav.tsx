import "./Nav.css"

const Nav = () => {
    return (
        <header>
            <nav>
                <a href="/">
                    <h4>Ingredients Checker</h4>
                </a>
                <div>
                    <ul className="nav-items">
                        <li><a href="#">About</a></li>
                        <li><a href="#">Allergens</a></li>
                    </ul>
                </div>
            </nav>
        </header>
    )
}

export default Nav;