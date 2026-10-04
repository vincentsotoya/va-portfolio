import { useEffect, useState } from "react";
import { site } from "../config/site";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.timeZone,
  hour: "2-digit",
  minute: "2-digit",
});

/** Live local time for the Owner's time zone, e.g. "09:41 PHT". */
export default function Clock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(format.format(new Date()));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="stat__time">
      {time} {site.timeZoneLabel}
    </span>
  );
}
