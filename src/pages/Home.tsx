import Logo from "../components/Logo"
import AppIcons from "../components/AppIcons";
import NewsSection from "../components/NewsSection";
import WeatherClock from "../components/WeatherClock";


export default function Home() {
    return (
        <div className="home">
            <div className="center-panel">
                <Logo />
                <AppIcons />
            </div>
            <NewsSection />
            <WeatherClock />
        </div>
    );
}