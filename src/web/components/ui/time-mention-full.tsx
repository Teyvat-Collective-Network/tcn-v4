import { FaClock } from "react-icons/fa6";
import Mention from "./mention";

export default function TimeMentionFull({ time }: { time: number | Date }) {
    const date = new Date(time);

    return (
        <Mention>
            <FaClock />
            {date.getFullYear()}&ndash;{(date.getMonth() + 1).toString().padStart(2, "0")}&ndash;{date.getDate().toString().padStart(2, "0")} |{" "}
            {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}:{date.getSeconds().toString().padStart(2, "0")}
        </Mention>
    );
}
