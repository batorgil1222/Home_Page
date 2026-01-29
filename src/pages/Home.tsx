import Logo from "../components/Logo"
import AppIcons from "../components/AppIcons";
import NewsSection from "../components/NewsSection";
import WeatherClock from "../components/WeatherClock";


export default function Home() {
    return (
        <div className="home">
            <Logo />
            <div className="center-panel">
                <AppIcons />
            </div>
            <NewsSection />
            <WeatherClock />
        </div>
    );
}