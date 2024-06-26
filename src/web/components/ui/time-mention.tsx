import { FaClock } from "react-icons/fa6";
import Mention from "./mention";

export default function TimeMention({ time }: { time: number | Date }) {
    const date = new Date(time);

    return (
        <Mention>
            <FaClock />
            {date.getFullYear()}-{(date.getMonth() + 1).toString().padStart(2, "0")}-{date.getDate().toString().padStart(2, "0")}
        </Mention>
    );
}
