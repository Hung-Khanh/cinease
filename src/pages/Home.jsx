import { Carousel } from "antd";
import Slide1 from "../assets/Slide1.png";
import Slide2 from "../assets/Slide2.png";
import Slide3 from "../assets/Slide3.png";
import Slide4 from "../assets/Slide4.png";
import "./Home.css";

const Home = () => {
    return (
        <div className="home">
            <main className="home-content">
                <section className="home-slide">
                    <div className="slide-container">
                        <Carousel autoplay effect="fade" style={{ width: "100%", height: "auto",maxHeight: "400px" }}>
                            <div>
                                <img src={Slide1} alt="Slide1" />
                            </div>  
                            <div>
                                <img src={Slide2} alt="Slide2" />
                            </div>
                            <div>
                                <img src={Slide3} alt="Slide3" />
                            </div>
                            <div>
                                <img src={Slide4} alt="Slide4" />
                            </div>
                        </Carousel>
                    </div>
                </section> 
            </main>
        </div>
    );
};

export default Home;